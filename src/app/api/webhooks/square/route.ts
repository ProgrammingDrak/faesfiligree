import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { isSquareConfigured } from "@/lib/square/client";
import { handlePaymentCompleted } from "@/lib/square/webhooks";

function verifySignature(
  body: string,
  signature: string | null,
  signatureKey: string,
  notificationUrl: string
): boolean {
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", signatureKey);
  hmac.update(notificationUrl + body);
  const expected = hmac.digest("base64");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

export async function POST(request: NextRequest) {
  if (!isSquareConfigured()) {
    return NextResponse.json(
      { error: "Square not configured" },
      { status: 500 }
    );
  }

  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const rawBody = await request.text();

  if (signatureKey) {
    const signature = request.headers.get("x-square-hmacsha256-signature");
    const notificationUrl = request.url;
    if (!verifySignature(rawBody, signature, signatureKey, notificationUrl)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  try {
    const body = JSON.parse(rawBody);

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
