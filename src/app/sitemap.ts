import { MetadataRoute } from "next"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { getBaseURL } from "@lib/util/env"

export const revalidate = 3600 // Her saat başı sitemap güncellenir

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseURL().replace(/\/$/, "")

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/tr`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tr/store`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ]

  const categoryEntries: MetadataRoute.Sitemap = []
  try {
    const categories = await listCategories().catch(() => [])
    if (categories && Array.isArray(categories)) {
      for (const cat of categories) {
        if (cat.handle) {
          categoryEntries.push({
            url: `${baseUrl}/tr/categories/${cat.handle}`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
          })
        }
      }
    }
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error)
  }

  const productEntries: MetadataRoute.Sitemap = []
  try {
    const { response } = await listProducts({
      countryCode: "tr",
      queryParams: { limit: 1000 },
    }).catch(() => ({ response: { products: [] } }))

    if (response?.products && Array.isArray(response.products)) {
      for (const product of response.products) {
        if (product.handle) {
          productEntries.push({
            url: `${baseUrl}/tr/products/${product.handle}`,
            lastModified: product.updated_at
              ? new Date(product.updated_at)
              : new Date(),
            changeFrequency: "daily",
            priority: 0.9,
          })
        }
      }
    }
  } catch (error) {
    console.error("Error fetching products for sitemap:", error)
  }

  return [...staticEntries, ...categoryEntries, ...productEntries]
}
