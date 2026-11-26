import { fetchStorePixelConfig } from "@modules/layout/components/pixel-scripts"

export const dynamic = "force-dynamic"

export async function GET() {
  const config = await fetchStorePixelConfig()
  const defaultRobotsTxt = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /checkout",
    "Disallow: /account",
    "Disallow: /cart",
    "Disallow: /*/checkout",
    "Disallow: /*/account",
    "Disallow: /*/cart",
    "",
    "Sitemap: https://cizgibutik.com/sitemap.xml",
  ].join("\n")

  const content =
    config?.robots_txt?.active !== false && config?.robots_txt?.content
      ? config.robots_txt.content
      : defaultRobotsTxt

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  })
}
