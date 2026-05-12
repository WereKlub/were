import { NextRequest, NextResponse } from "next/server";
import { clientNoCdn } from "@/lib/sanity/client";

export const runtime = "nodejs";

/** Server-side Groq runner for browser callers (cart, etc.). Avoids long-query GET URL limits and uses the configured Sanity client. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = typeof body?.query === "string" ? body.query : null;
    const params =
      body?.params !== undefined &&
      body.params !== null &&
      typeof body.params === "object" &&
      !Array.isArray(body.params)
        ? (body.params as Record<string, unknown>)
        : {};

    if (!query) {
      return NextResponse.json(
        { error: "Body must include { query: string }" },
        { status: 400 },
      );
    }

    const result = await clientNoCdn.fetch(query, params);
    return NextResponse.json({ result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch from Sanity";
    console.error("Sanity proxy error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
