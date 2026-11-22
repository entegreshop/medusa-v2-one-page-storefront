import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Tüm Ürünler - Yeni Sezon Kadın Giyim Modelleri | Çizgi Butik",
  description:
    "Çizgi Butik yeni sezon kadın giyim modelleri, elbiseler, ikili takımlar, ceketler ve aksesuarlar en uygun fiyat, kapıda ödeme ve hızlı kargo avantajıyla burada!",
  keywords: [
    "kadın giyim",
    "yeni sezon",
    "butik modelleri",
    "elbiseler",
    "ikili takım",
    "çizgi butik",
    "kapıda ödeme",
    "online butik",
  ],
  alternates: {
    canonical: "https://cizgibutik.com/tr/store",
    languages: {
      "tr-TR": "https://cizgibutik.com/tr/store",
      "x-default": "https://cizgibutik.com/tr/store",
    },
  },
  openGraph: {
    title: "Tüm Ürünler | Çizgi Butik",
    description:
      "Yeni sezon kadın giyim modelleri ve kombinleri Çizgi Butik'te.",
    url: "https://cizgibutik.com/tr/store",
    siteName: "Çizgi Butik",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tüm Ürünler | Çizgi Butik",
    description:
      "Yeni sezon kadın giyim modelleri ve kombinleri Çizgi Butik'te.",
  },
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  )
}
