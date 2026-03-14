import { NextRequest, NextResponse } from "next/server";
import { isSquareConfigured } from "@/lib/square/client";
import { handlePaymentCompleted } from "@/lib/square/webhooks";

export async function POST(request: NextRequest) {
  if (!isSquareConfigured()) {
    return NextResponse.json(
      { error: "Square not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    // Square sends webhook events with a `type` field
    switch (body.type) {
      case "payment.completed": {
        await handlePaymentCompleted(body);
        break;
      }
      default:
        console.log(`Unhandled Square event type: ${body.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Square webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
