import { Metadata } from "next"
import { redirect } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

export async function generateStaticParams() {
  try {
    const product_categories = await listCategories()

    if (!product_categories) {
      return []
    }

    const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    const categoryHandles = product_categories.map(
      (category: any) => category.handle
    )

    const staticParams = countryCodes
      ?.map((countryCode: string | undefined) =>
        categoryHandles.map((handle: any) => ({
          countryCode,
          category: [handle],
        }))
      )
      .flat()

    return staticParams
  } catch (error) {
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(params.category)
    if (!productCategory) {
      return { title: "Çizgi Butik | Kategoriler" }
    }

    const title = productCategory.name + " | Çizgi Butik"
    const description = productCategory.description ?? `${title}`

    return {
      title,
      description,
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    }
  } catch (error) {
    return { title: "Çizgi Butik | Kategoriler" }
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams

  let productCategory = await getCategoryByHandle(params.category).catch(() => null)

  if (!productCategory) {
    const allCats = await listCategories().catch(() => [])
    const targetSlug = (params.category?.[params.category.length - 1] || "").toLowerCase()
    productCategory =
      allCats?.find(
        (c: any) =>
          c.handle?.toLowerCase() === targetSlug ||
          c.handle?.toLowerCase()?.includes(targetSlug) ||
          targetSlug.includes(c.handle?.toLowerCase() || "___")
      ) || null
  }

  if (!productCategory) {
    redirect(`/${params.countryCode || "tr"}/store`)
  }

  return (
    <CategoryTemplate
      category={productCategory}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode || "tr"}
    />
  )
}
