import { reconcileSquarePayment, type SquarePaymentEvidence } from "./orders";

interface WebhookAddress {
  address_line_1?: string | null;
  address_line_2?: string | null;
  locality?: string | null;
  administrative_district_level_1?: string | null;
  postal_code?: string | null;
}

interface SquarePaymentEvent {
  type?: string;
  data?: {
    object?: {
      payment?: {
        id?: string;
        order_id?: string;
        status?: string;
        amount_money?: { amount?: number | string; currency?: string };
        buyer_email_address?: string | null;
        shipping_address?: WebhookAddress | null;
      };
    };
  };
}

function paymentEvidence(event: SquarePaymentEvent): SquarePaymentEvidence | null {
  const payment = event.data?.object?.payment;
  const amount = payment?.amount_money?.amount;
  if (
    !payment?.id ||
    !payment.order_id ||
    amount == null ||
    !payment.amount_money?.currency
  ) {
    return null;
  }

  const address = payment.shipping_address;
  return {
    id: payment.id,
    orderId: payment.order_id,
    status: payment.status ?? "",
    amount: BigInt(amount),
    currency: payment.amount_money.currency,
    buyerEmail: payment.buyer_email_address,
    shippingAddress: address ? {
      addressLine1: address.address_line_1,
      addressLine2: address.address_line_2,
      locality: address.locality,
      administrativeDistrictLevel1: address.administrative_district_level_1,
      postalCode: address.postal_code,
    } : null,
  };
}

/** Record completed payment-link orders when Square delivers their webhook. */
export async function handlePaymentEvent(event: SquarePaymentEvent) {
  if (event.type !== "payment.created" && event.type !== "payment.updated") return;
  const evidence = paymentEvidence(event);
  if (!evidence || evidence.status !== "COMPLETED") return;

  const result = await reconcileSquarePayment(evidence);
  if (result.status === "error") {
    throw new Error(`Failed to reconcile Square payment ${evidence.id}`);
  }
}
