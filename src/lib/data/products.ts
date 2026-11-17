"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

const bulkProductsCache = new Map<
  string,
  { products: HttpTypes.StoreProduct[]; count: number; expiresAt: number }
>()

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const cacheKey = `${region.id}:${offset}:${limit}:${JSON.stringify(queryParams || {})}`
  const cached = bulkProductsCache.get(cacheKey)
  if (cached && Date.now() < cached.expiresAt) {
    const nextPage = cached.count > offset + limit ? pageParam + 1 : null
    return {
      response: {
        products: cached.products,
        count: cached.count,
      },
      nextPage,
      queryParams,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
    revalidate: 60,
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,*categories",
          ...queryParams,
        },
        headers,
        next,
      }
    )
    .then(({ products, count }) => {
      if (products && products.length > 0) {
        bulkProductsCache.set(cacheKey, {
          products,
          count,
          expiresAt: Date.now() + 60 * 1000,
        })
      }

      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage,
        queryParams,
      }
    })
}

export const listProductsWithSort = async ({
  page = 1,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12
  const currentPage = Math.max(page, 1)

  if (sortBy === "price_asc" || sortBy === "price_desc") {
    const {
      response: { products, count },
    } = await listProducts({
      pageParam: 1,
      queryParams: {
        ...queryParams,
        limit: 100,
      },
      countryCode,
    })

    const sortedProducts = sortProducts(products, sortBy)
    const startOffset = (currentPage - 1) * limit
    const paginatedProducts = sortedProducts.slice(startOffset, startOffset + limit)
    const nextPage = count > startOffset + limit ? currentPage + 1 : null

    return {
      response: {
        products: paginatedProducts,
        count,
      },
      nextPage,
      queryParams,
    }
  }

  return listProducts({
    pageParam: currentPage,
    queryParams: {
      ...queryParams,
      limit,
      order: "-created_at",
    },
    countryCode,
  })
}
