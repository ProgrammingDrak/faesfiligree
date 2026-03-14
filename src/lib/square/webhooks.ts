import { prisma, isDatabaseConfigured } from "@/lib/db";

interface SquarePaymentEvent {
  type: string;
  data?: {
    object?: {
      payment?: {
        id: string;
        note?: string;
      };
    };
  };
}

export async function handlePaymentCompleted(event: SquarePaymentEvent) {
  console.log("Square payment completed:", event.data?.object?.payment?.id);

  if (isDatabaseConfigured()) {
    // The note field contains product names from the order.
    // A production implementation would store product IDs in order metadata
    // and use those to update inventory.
    console.log("Order note:", event.data?.object?.payment?.note);

    // TODO: Parse order metadata to get product IDs and create Sale records,
    // then mark one-of-a-kind pieces as out of stock:
    // await prisma.product.update({ where: { id }, data: { inStock: false } });
  }
}
