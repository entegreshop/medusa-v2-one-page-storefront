import { NextResponse } from "next/server"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const categories = await listCategories().catch(() => [])
    const { response } = await listProducts({
      countryCode: "tr",
      queryParams: { limit: 100 },
    }).catch(() => ({ response: { products: [] } }))

    const categoryList = (categories || [])
      .map((c: any) => `- [${c.name}](https://cizgibutik.com/tr/categories/${c.handle})`)
      .join("\n")

    const productList = (response?.products || [])
      .slice(0, 50)
      .map((p: any) => `- [${p.title}](https://cizgibutik.com/tr/products/${p.handle})`)
      .join("\n")

    const content = `# Çizgi Butik

> Çizgi Butik, Türkiye'nin önde gelen kadın giyim ve butik moda platformudur. Yeni sezon elbiseler, ikili takımlar, ceketler, jean modelleri ve özel kombinler en uygun fiyat, kapıda ödeme ve hızlı kargo avantajıyla sunulmaktadır.

- Web Sitesi: https://cizgibutik.com
- Lokasyon: Türkiye
- İletişim & Destek: https://cizgibutik.com/tr/store

## Popüler Kategoriler
${categoryList || "- [Tüm Ürünler](https://cizgibutik.com/tr/store)"}

## Öne Çıkan Ürünler
${productList || "- [Yeni Sezon Modeller](https://cizgibutik.com/tr/store)"}
`

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    })
  } catch (error) {
    return new NextResponse("# Çizgi Butik\nhttps://cizgibutik.com", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }
}
