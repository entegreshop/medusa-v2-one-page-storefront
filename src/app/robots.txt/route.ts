import { fetchStorePixelConfig } from "@modules/layout/components/pixel-scripts"

export const dynamic = "force-dynamic"

export async function GET() {
  const config = await fetchStorePixelConfig()
  const content =
    config?.robots_txt?.active !== false && config?.robots_txt?.content
      ? config.robots_txt.content
      : `User-agent: *\nAllow: /\nDisallow: /checkout\nDisallow: /account\nSitemap: https://cizgibutik.com/sitemap.xml`

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  })
}
