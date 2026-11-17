import { fetchStorePixelConfig } from "@modules/layout/components/pixel-scripts"

export const dynamic = "force-dynamic"

export async function GET() {
  const config = await fetchStorePixelConfig()
  const content =
    config?.llms_txt?.active !== false && config?.llms_txt?.content
      ? config.llms_txt.content
      : `# Çizgi Butik (cizgibutik.com)\n> Kadın giyim, ikili takım, kombin, jean pantolon, tayt, sweat, mont & kürk, t-shirt, gözlük ve çanta koleksiyonları.\n\n- Mağaza: https://cizgibutik.com/tr\n- Tüm Ürünler: https://cizgibutik.com/tr/store`

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  })
}
