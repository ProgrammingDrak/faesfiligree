import { sanityWriteClient, isSanityConfigured } from "@/lib/sanity/client";

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

  // In a full implementation, you would look up the order details
  // and mark the corresponding products as out of stock in Sanity.
  // For one-of-a-kind jewelry, each sold piece should be marked unavailable.
  if (isSanityConfigured()) {
    // The note field contains product names from the order.
    // A production implementation would store product IDs in order metadata
    // and use those to update inventory.
    console.log("Order note:", event.data?.object?.payment?.note);
  }
}
