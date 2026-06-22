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

/**
 * Logging/observability only. Sales and inventory are recorded in
 * `confirmOrder` (src/lib/square/actions.ts) when the buyer returns from
 * Square's hosted checkout — do NOT record sales here too, or every order
 * would be double-counted. This handler exists to confirm Square's own
 * record of the payment and to surface anything that needs reconciliation.
 * Go-live TODO: record here too (idempotently, keyed on the order's
 * reference id) to close the buyer-never-returns gap.
 */
export async function handlePaymentCompleted(event: SquarePaymentEvent) {
  console.log(
    "Square payment.completed:",
    event.data?.object?.payment?.id,
    "—",
    event.data?.object?.payment?.note
  );
}
