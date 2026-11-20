import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "https://api.cizgibutik.com"

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const upstream = await fetch(`${BACKEND_URL}/export/${encodeURIComponent(id)}`, {
      cache: "no-store",
      headers: {
        Accept: "application/xml, text/xml, */*",
      },
    })

    const xml = await upstream.text()
    return new NextResponse(xml, {
      status: upstream.status,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    })
  } catch (err) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
