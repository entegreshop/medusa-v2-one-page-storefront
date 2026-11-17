import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

let cachedAllCategories: {
  data: HttpTypes.StoreProductCategory[]
  expiresAt: number
} | null = null

export const listCategories = async (query?: Record<string, any>) => {
  const isDefaultQuery = !query || Object.keys(query).length === 0
  if (isDefaultQuery && cachedAllCategories && Date.now() < cachedAllCategories.expiresAt) {
    return cachedAllCategories.data
  }

  const next = {
    ...(await getCacheOptions("categories")),
    revalidate: 60,
  }

  const limit = query?.limit || 100

  const product_categories = await sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "id,name,handle,description,*category_children,*parent_category",
          limit,
          ...query,
        },
        next,
      }
    )
    .then(({ product_categories }) => product_categories || [])
    .catch(() => [])

  if (isDefaultQuery && product_categories.length > 0) {
    cachedAllCategories = {
      data: product_categories,
      expiresAt: Date.now() + 60 * 1000,
    }
  }

  return product_categories
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.map((h) => decodeURIComponent(h)).join("/")}`

  // First try in-memory / cached categories list
  const allCats = await listCategories()
  const exactFromList = allCats.find(
    (c) => c.handle?.toLowerCase() === handle.toLowerCase()
  )
  if (exactFromList) {
    return exactFromList
  }

  const next = {
    ...(await getCacheOptions("categories")),
    revalidate: 60,
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "id,name,handle,description,*category_children,*parent_category",
          handle,
        },
        next,
      }
    )
    .then(({ product_categories }) => product_categories?.[0])
    .catch(() => undefined)
}
