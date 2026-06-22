import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { isSquareConfigured } from "@/lib/square/client";
import { handlePaymentCompleted } from "@/lib/square/webhooks";

/**
 * Verify the request really came from Square. Square signs each webhook with
 * an HMAC-SHA256 of (notification URL + raw body), keyed by the endpoint's
 * signature key, and sends it in the `x-square-hmacsha256-signature` header.
 * See https://developer.squareup.com/docs/webhooks/step3validate
 */
function isValidSignature(rawBody: string, signature: string | null): boolean {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  // No key configured → skip verification (e.g. local/sandbox). Set the key in
  // production so forged webhooks are rejected.
  if (!signatureKey) return true;
  if (!signature) return false;

  const notificationUrl =
    process.env.SQUARE_WEBHOOK_URL ||
    `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/webhooks/square`;

  const expected = crypto
    .createHmac("sha256", signatureKey)
    .update(notificationUrl + rawBody)
    .digest("base64");

  // Constant-time compare to avoid timing leaks.
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!isSquareConfigured()) {
    return NextResponse.json(
      { error: "Square not configured" },
      { status: 500 }
    );
  }

  // Read the raw body so the signature can be verified over the exact bytes.
  const rawBody = await request.text();
  const signature = request.headers.get("x-square-hmacsha256-signature");

  if (!isValidSignature(rawBody, signature)) {
    console.warn("Square webhook: invalid signature, rejecting");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
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
