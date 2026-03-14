import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATION_SECRET;

  // Verify webhook secret
  const authHeader = request.headers.get("authorization");
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const type = body._type as string;

    // Revalidate based on document type
    switch (type) {
      case "product":
        revalidateTag("products");
        break;
      case "galleryPiece":
        revalidateTag("gallery");
        break;
      case "category":
        revalidateTag("categories");
        revalidateTag("products");
        revalidateTag("gallery");
        break;
      case "siteSettings":
        revalidateTag("siteSettings");
        break;
      default:
        revalidateTag("products");
        revalidateTag("gallery");
    }

    return NextResponse.json({
      revalidated: true,
      type,
      now: Date.now(),
    });
  } catch (error) {
    console.error("Sanity webhook error:", error);
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500 }
    );
  }
}
