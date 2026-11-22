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
  const countryCode = params.countryCode || "tr"
  try {
    const productCategory = await getCategoryByHandle(params.category)
    if (!productCategory) {
      return {
        title: "Kadın Giyim Koleksiyonları | Çizgi Butik",
        description: "En yeni kadın giyim trendleri, elbiseler, takımlar ve butik koleksiyonlar Çizgi Butik'te.",
      }
    }

    const title = `${productCategory.name} Modelleri ve Fiyatları | Çizgi Butik`
    const description =
      productCategory.description ||
      `${productCategory.name} modelleri, en uygun fiyatlar, kapıda ödeme ve hızlı kargo avantajıyla Çizgi Butik'te! Yeni sezon ${productCategory.name} kombinlerini hemen keşfedin.`
    const canonicalUrl = `https://cizgibutik.com/${countryCode}/categories/${params.category.join("/")}`

    return {
      title,
      description,
      keywords: [
        productCategory.name,
        `${productCategory.name} modelleri`,
        `${productCategory.name} fiyatları`,
        `${productCategory.name} satın al`,
        "kadın giyim",
        "yeni sezon",
        "butik giyim",
        "çizgi butik",
        "kapıda ödeme",
        "hızlı kargo",
      ],
      alternates: {
        canonical: canonicalUrl,
        languages: {
          "tr-TR": `https://cizgibutik.com/tr/categories/${params.category.join("/")}`,
          "x-default": `https://cizgibutik.com/tr/categories/${params.category.join("/")}`,
        },
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "Çizgi Butik",
        locale: "tr_TR",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    }
  } catch (error) {
    return { title: "Kadın Giyim Koleksiyonları | Çizgi Butik" }
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
