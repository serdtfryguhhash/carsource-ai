import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name");
  if (!name) {
    return new NextResponse("Missing name parameter", { status: 400 });
  }

  try {
    const wikiRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
      { headers: { "User-Agent": "CarSourceAI/1.0 (automotive education app)" } }
    );
    if (wikiRes.ok) {
      const data = await wikiRes.json();
      if (data.originalimage?.source || data.thumbnail?.source) {
        const imageUrl = data.originalimage?.source || data.thumbnail?.source;
        return new NextResponse(null, {
          status: 307,
          headers: {
            Location: imageUrl,
            "Cache-Control": "public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400",
          },
        });
      }
    }
  } catch {}

  // Fallback: generate a placeholder with the car name
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name.replace(/_/g, " "))}&size=800&background=1a1a2e&color=dc2626&bold=true&font-size=0.25`;
  return new NextResponse(null, {
    status: 307,
    headers: { Location: fallbackUrl, "Cache-Control": "public, max-age=86400" },
  });
}
