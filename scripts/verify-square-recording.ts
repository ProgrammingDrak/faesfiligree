import assert from "node:assert/strict";
import type { Prisma } from "@prisma/client";
import { getPrisma } from "../src/lib/db";
import { handlePaymentEvent } from "../src/lib/square/webhooks";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");
const host = new URL(connectionString).hostname;
if (host !== "localhost" && host !== "127.0.0.1") {
  throw new Error(`Refusing to test against non-local database host "${host}"`);
}

async function main() {
  const prisma = getPrisma();
  const suffix = crypto.randomUUID();
  const productId = `square-test-product-${suffix}`;
  const orderId = `square-test-order-${suffix}`;
  const squareOrderId = `square-order-${suffix}`;

  try {
    await prisma.product.create({
      data: {
        id: productId,
        name: "Square recording test product",
        slug: `square-recording-test-${suffix}`,
        price: 1500,
        images: [],
        materials: [],
        quantityMade: 5,
        quantityAvailable: 5,
      },
    });
    await prisma.order.create({
      data: {
        id: orderId,
        ref: `square-test-ref-${suffix}`,
        squareOrderId,
        subtotal: 3000,
        itemsSnapshot: [
          {
            productId,
            name: "Square recording test product",
            quantity: 2,
            price: 1500,
          },
        ] as Prisma.InputJsonValue,
      },
    });

    const event = {
      type: "payment.updated",
      data: {
        object: {
          payment: {
            id: `square-payment-${suffix}`,
            order_id: squareOrderId,
            status: "COMPLETED",
            amount_money: { amount: 3000, currency: "USD" },
            buyer_email_address: "checkout-test@example.com",
            shipping_address: {
              address_line_1: "1 Test Lane",
              locality: "Testville",
              administrative_district_level_1: "NY",
              postal_code: "10001",
            },
          },
        },
      },
    };

    await assert.rejects(
      handlePaymentEvent({
        ...event,
        data: {
          object: {
            payment: {
              ...event.data.object.payment,
              amount_money: { amount: 2999, currency: "USD" },
            },
          },
        },
      }),
      /amount did not match/,
    );
    assert.equal(
      (await prisma.order.findUniqueOrThrow({ where: { id: orderId } })).status,
      "pending",
    );

    await Promise.all([handlePaymentEvent(event), handlePaymentEvent(event)]);

    const [order, product, sales] = await Promise.all([
      prisma.order.findUniqueOrThrow({ where: { id: orderId } }),
      prisma.product.findUniqueOrThrow({ where: { id: productId } }),
      prisma.sale.findMany({ where: { orderId } }),
    ]);
    assert.equal(order.status, "paid");
    assert.equal(order.buyerEmail, "checkout-test@example.com");
    assert.equal(product.quantityAvailable, 3);
    assert.equal(product.soldCount, 2);
    assert.equal(product.soldRevenue, 3000);
    assert.equal(sales.length, 1);
    assert.equal(sales[0].processingFee, 88);
    console.log("Square recording verification passed");
  } finally {
    await prisma.sale.deleteMany({ where: { orderId } });
    await prisma.order.deleteMany({ where: { id: orderId } });
    await prisma.product.deleteMany({ where: { id: productId } });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
