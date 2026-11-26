import { HttpTypes } from "@medusajs/types"

export const dynamic = "force-dynamic"

function escapeXml(unsafe: string): string {
  return (unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "https://api.cizgibutik.com"
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export async function GET() {
  const baseUrl = "https://cizgibutik.com"
  const nowIso = new Date().toISOString().split("T")[0]

  const staticPages = [
    { loc: `${baseUrl}/tr`, priority: "1.0", changefreq: "daily", lastmod: nowIso },
    { loc: `${baseUrl}/tr/store`, priority: "0.9", changefreq: "daily", lastmod: nowIso },
  ]

  const headers: Record<string, string> = {}
  if (PUBLISHABLE_API_KEY) {
    headers["x-publishable-api-key"] = PUBLISHABLE_API_KEY
  }

  // 1. Fetch Categories
  const categoryUrls: Array<{ loc: string; lastmod: string }> = []
  try {
    const res = await fetch(`${BACKEND_URL}/store/product-categories?limit=200`, {
      headers,
      next: { revalidate: 3600 },
    } as any)
    if (res.ok) {
      const data = await res.json()
      if (data?.product_categories && Array.isArray(data.product_categories)) {
        for (const cat of data.product_categories) {
          if (cat.handle) {
            categoryUrls.push({
              loc: `${baseUrl}/tr/categories/${cat.handle}`,
              lastmod: nowIso,
            })
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed to fetch categories for sitemap:", err)
  }

  // 2. Fetch Products
  let products: Array<{
    id: string
    handle: string
    title?: string
    thumbnail?: string
    updated_at?: string
  }> = []

  try {
    let offset = 0
    const limit = 200
    let hasMore = true

    while (hasMore) {
      const res = await fetch(
        `${BACKEND_URL}/store/products?limit=${limit}&offset=${offset}&fields=id,handle,title,thumbnail,updated_at`,
        {
          headers,
          next: { revalidate: 3600 },
        } as any
      )

      if (res.ok) {
        const data = await res.json()
        if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
          products = products.concat(data.products)
          offset += data.products.length
          if (offset >= (data.count || 0) || data.products.length < limit) {
            hasMore = false
          }
        } else {
          hasMore = false
        }
      } else {
        hasMore = false
      }

      if (offset > 5000) {
        break
      }
    }
  } catch (err) {
    console.error("Failed to fetch products for sitemap:", err)
  }

  const xmlUrls: string[] = []

  // Add static routes
  for (const page of staticPages) {
    xmlUrls.push(`  <url>
    <loc>${escapeXml(page.loc)}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`)
  }

  // Add category routes
  for (const cat of categoryUrls) {
    xmlUrls.push(`  <url>
    <loc>${escapeXml(cat.loc)}</loc>
    <lastmod>${cat.lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`)
  }

  // Add all product routes with Google Image SEO
  for (const prod of products) {
    if (!prod.handle) continue
    const prodUrl = `${baseUrl}/tr/products/${prod.handle}`
    const lastmod = prod.updated_at
      ? new Date(prod.updated_at).toISOString().split("T")[0]
      : nowIso

    let imageXml = ""
    if (prod.thumbnail) {
      imageXml = `
    <image:image>
      <image:loc>${escapeXml(prod.thumbnail)}</image:loc>
      <image:title>${escapeXml(prod.title || "Çizgi Butik Kadın Giyim")}</image:title>
    </image:image>`
    }

    xmlUrls.push(`  <url>
    <loc>${escapeXml(prodUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>${imageXml}
  </url>`)
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlUrls.join("\n")}
</urlset>`

  return new Response(sitemapXml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
