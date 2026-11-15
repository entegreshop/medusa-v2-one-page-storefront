import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import CouponBanner from "@modules/home/components/coupon-banner"
import PromoBanners from "@modules/home/components/promo-banners"
import TrustBadges from "@modules/home/components/trust-badges"
import CategoryTabs from "@modules/home/components/category-tabs"
import ProductCarouselBlock, { CarouselBlockConfig } from "@modules/home/components/product-carousel-block"
import BannerCategoryCarousel, { BannerCarouselConfig } from "@modules/home/components/banner-category-carousel"
import { Text } from "@medusajs/ui"
import InfiniteProducts from "@modules/store/components/infinite-products"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { getDictionary } from "@lib/util/get-dictionary"
import { getCategoryByHandle } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"

export const metadata: Metadata = {
  description: "Çizgi Butik - Yeni Sezon Kadın Giyim, Jean, Tayt ve Kombin Koleksiyonu",
}

const NEXT_PUBLIC_MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "https://api.cizgibutik.com"
const NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

async function getHeroConfig() {
  try {
    const headers: Record<string, string> = {}
    if (NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers["x-publishable-api-key"] = NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }
    const res = await fetch(`${NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/hero-config`, {
      next: { revalidate: 10 },
      headers,
    })
    const data = await res.json()
    return data?.config || null
  } catch (err) {
    console.error("Failed to fetch hero config in Home page:", err)
    return null
  }
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  const dict = await getDictionary(countryCode)
  const config = await getHeroConfig()

  const marqueeText = config?.scrolling_text_home
  const repeatedText = marqueeText
    ? Array(8).fill(marqueeText).join("\u00A0\u00A0\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0\u00A0\u00A0") + "\u00A0\u00A0\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0\u00A0\u00A0"
    : ""

  const categoryQuery = searchParams.category || "yeni-gelenler"

  // Always fetch latest products pool for the n11-style Category Tab Carousel
  const latestRes = await listProducts({
    regionId: region.id,
    queryParams: {
      fields: "*variants.calculated_price",
      limit: 20,
      order: "-created_at",
    },
  })
  const allProducts = latestRes.response.products || []

  let products: any[] = allProducts
  let count = latestRes.response.count || allProducts.length
  let activeCategoryId: string | undefined = undefined
  let activeCollectionId: string | undefined = undefined

  if (
    categoryQuery === "tumu" ||
    categoryQuery === "yeni-gelenler" ||
    categoryQuery === "kuponlu-urun" ||
    categoryQuery === "indirimli-urun" ||
    categoryQuery === "cok-al-az-ode"
  ) {
    products = allProducts
    count = latestRes.response.count
  } else if (categoryQuery === "cok-satanlar") {
    const cokSatanlarCollection =
      collections.find((c) => c.handle === "çok-satanlar" || c.handle === "cok-satanlar") || collections[0]

    if (cokSatanlarCollection) {
      activeCollectionId = cokSatanlarCollection.id
      const res = await listProducts({
        regionId: region.id,
        queryParams: {
          collection_id: [cokSatanlarCollection.id],
          fields: "*variants.calculated_price",
          limit: 16,
        },
      })
      if (res.response.products?.length > 0) {
        products = res.response.products
        count = res.response.count
      }
    }
  } else {
    const categoryObj = await getCategoryByHandle([categoryQuery])
    if (categoryObj) {
      activeCategoryId = categoryObj.id
      const res = await listProducts({
        regionId: region.id,
        queryParams: {
          category_id: [categoryObj.id],
          fields: "*variants.calculated_price",
          limit: 16,
        },
      })
      if (res.response.products?.length > 0) {
        products = res.response.products
        count = res.response.count
      }
    }
  }

  // Load products for configured Carousel Blocks
  const rawCarousels: CarouselBlockConfig[] = Array.isArray(config?.carousel_blocks)
    ? config.carousel_blocks.filter((b: CarouselBlockConfig) => b && b.active !== false)
    : []

  const resolvedCarousels = await Promise.all(
    rawCarousels.map(async (block) => {
      try {
        const limit = block.limit || 8
        if (block.source_type === "category" && block.handle) {
          const catObj = await getCategoryByHandle([block.handle])
          if (catObj) {
            const res = await listProducts({
              regionId: region.id,
              queryParams: {
                category_id: [catObj.id],
                fields: "*variants.calculated_price",
                limit,
              },
            })
            return { block, products: res.response.products }
          }
        } else if (block.source_type === "collection" && block.handle) {
          const colObj = collections.find((c) => c.handle === block.handle)
          if (colObj) {
            const res = await listProducts({
              regionId: region.id,
              queryParams: {
                collection_id: [colObj.id],
                fields: "*variants.calculated_price",
                limit,
              },
            })
            return { block, products: res.response.products }
          }
        }
        // Default: latest products
        const res = await listProducts({
          regionId: region.id,
          queryParams: {
            fields: "*variants.calculated_price",
            limit,
            order: "-created_at",
          },
        })
        return { block, products: res.response.products }
      } catch (e) {
        return { block, products: [] }
      }
    })
  )

  const carouselsAboveBanners = resolvedCarousels.filter((c) => c.block.position === "above_banners")
  const carouselsBelowBanners = resolvedCarousels.filter(
    (c) => !c.block.position || c.block.position === "below_banners" || c.block.position === "below_categories"
  )
  const carouselsBelowProducts = resolvedCarousels.filter((c) => c.block.position === "below_products")

  // Load products for Banner-Overlaid Category Carousels (n11 Style without top circular brand badges)
  const defaultBannerCarousels: BannerCarouselConfig[] = [
    {
      id: "banner-carousel-1",
      title: "Kışlık Kombinler",
      title_color: "#111827",
      cta_text: "Fırsatları Kaçırma",
      cta_link: "/store",
      cta_color: "#f02d9c",
      footer_note: "Sezon sonuna kadar geçerlidir. Fırsat; kupon ve sepette indirim avantajlarını kapsar.",
      badge_text: "YENİ SEZON FIRSATI",
      bg_image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80",
      bg_color: "#dce6f2",
      source_type: "latest",
      handle: "",
      limit: 8,
      position: "below_collection",
      free_shipping_text: "HIZLI KARGO",
      active: true,
    },
  ]

  const rawBannerCarousels: BannerCarouselConfig[] = Array.isArray(config?.banner_carousels)
    ? config.banner_carousels.filter((b: BannerCarouselConfig) => b && b.active !== false)
    : defaultBannerCarousels

  const resolvedBannerCarousels = await Promise.all(
    rawBannerCarousels.map(async (bBlock) => {
      try {
        const limit = bBlock.limit || 8
        if (bBlock.source_type === "category" && bBlock.handle) {
          const catObj = await getCategoryByHandle([bBlock.handle])
          if (catObj) {
            const res = await listProducts({
              regionId: region.id,
              queryParams: {
                category_id: [catObj.id],
                fields: "*variants.calculated_price",
                limit,
              },
            })
            if (res.response.products?.length > 0) {
              return { block: bBlock, products: res.response.products }
            }
          }
        } else if (bBlock.source_type === "collection" && bBlock.handle) {
          const colObj = collections.find((c) => c.handle === bBlock.handle)
          if (colObj) {
            const res = await listProducts({
              regionId: region.id,
              queryParams: {
                collection_id: [colObj.id],
                fields: "*variants.calculated_price",
                limit,
              },
            })
            if (res.response.products?.length > 0) {
              return { block: bBlock, products: res.response.products }
            }
          }
        }
        return { block: bBlock, products: allProducts.slice(0, limit) }
      } catch (e) {
        return { block: bBlock, products: allProducts.slice(0, 8) }
      }
    })
  )

  const isHeroReplacedByCarousel = config?.hero_display_mode === "banner_carousel"
  const showHeroBanner =
    config?.show_hero_banner !== false &&
    config?.hero_display_mode !== "banner_carousel" &&
    config?.hero_display_mode !== "hidden"

  const bannerCarouselsReplaceHero = resolvedBannerCarousels.filter(
    (c) => c.block.position === "replace_hero" || (isHeroReplacedByCarousel && c === resolvedBannerCarousels[0])
  )
  const bannerCarouselsAboveBanners = resolvedBannerCarousels.filter(
    (c) => !bannerCarouselsReplaceHero.includes(c) && c.block.position === "above_banners"
  )
  const bannerCarouselsBelowBanners = resolvedBannerCarousels.filter(
    (c) => !bannerCarouselsReplaceHero.includes(c) && c.block.position === "below_banners"
  )
  const bannerCarouselsBelowCollection = resolvedBannerCarousels.filter(
    (c) =>
      !bannerCarouselsReplaceHero.includes(c) &&
      (!c.block.position || c.block.position === "below_collection")
  )
  const bannerCarouselsBelowProducts = resolvedBannerCarousels.filter(
    (c) => !bannerCarouselsReplaceHero.includes(c) && c.block.position === "below_products"
  )

  const configuredCategories = (config?.categories || []).filter((c: any) => c.active !== false)

  return (
    <>
      {/* 0. BellButik Style Luxury Coupon Banner Above Hero */}
      <CouponBanner config={config?.coupon_banner} />

      {/* 1. Campaign Hero Slider (or Banner-Overlaid Category Carousel if configured to replace Hero) */}
      {showHeroBanner && <Hero dict={dict} />}

      {bannerCarouselsReplaceHero.map((item) => (
        <BannerCategoryCarousel key={item.block.id} bannerBlock={item.block} products={item.products} region={region} />
      ))}

      {/* Home page scrolling announcement marquee (placed below Hero) */}
      {config?.scrolling_text_home_enabled !== false && marqueeText && (
        <div
          className="overflow-hidden relative w-full select-none border-b border-black/10"
          style={{ backgroundColor: config.scrolling_text_home_bg || "#000000" }}
        >
          <style>{`
            @keyframes marquee-home {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
            .animate-marquee-home {
              display: inline-flex;
              white-space: nowrap;
              animation: marquee-home 40s linear infinite;
            }
          `}</style>
          <div className="flex w-max py-2.5">
            <div
              className="animate-marquee-home flex items-center text-xs font-semibold uppercase tracking-wider"
              style={{ color: config.scrolling_text_home_text_color || "#ffffff" }}
            >
              <span>{repeatedText}</span>
              <span>{repeatedText}</span>
            </div>
          </div>
        </div>
      )}

      {/* Banner-Overlaid Category Carousels placed Above Banners */}
      {bannerCarouselsAboveBanners.map((item) => (
        <BannerCategoryCarousel key={item.block.id} bannerBlock={item.block} products={item.products} region={region} />
      ))}

      {/* Carousel Blocks placed Above Banners */}
      {carouselsAboveBanners.map((item) => (
        <ProductCarouselBlock key={item.block.id} block={item.block} products={item.products} region={region} />
      ))}

      {/* 2. Campaign Double Bento Banners */}
      {config?.show_promo_banners !== false && <PromoBanners />}

      {/* Banner-Overlaid Category Carousels placed Below Banners */}
      {bannerCarouselsBelowBanners.map((item) => (
        <BannerCategoryCarousel key={item.block.id} bannerBlock={item.block} products={item.products} region={region} />
      ))}

      {/* Carousel Blocks placed Below Banners */}
      {carouselsBelowBanners.map((item) => (
        <ProductCarouselBlock key={item.block.id} block={item.block} products={item.products} region={region} />
      ))}

      {/* 3. n11-Style Category Pill Tab Bar & 5-Column Product Carousel */}
      {config?.show_category_circles !== false && (
        <CategoryTabs
          categories={configuredCategories}
          activeCategory={categoryQuery}
          products={products}
          allProducts={allProducts}
          region={region}
          sectionConfig={config?.category_tab_carousel}
        />
      )}

      {/* Banner-Overlaid Category Carousels placed Below Collection */}
      {bannerCarouselsBelowCollection.map((item) => (
        <BannerCategoryCarousel key={item.block.id} bannerBlock={item.block} products={item.products} region={region} />
      ))}

      {/* 4. Products Grid Section */}
      <div className="bg-white py-12 border-b border-zinc-200">
        <div className="content-container">
          {products && products.length > 0 ? (
            <InfiniteProducts
              initialProducts={products}
              count={count}
              region={region}
              countryCode={countryCode}
              categoryId={activeCategoryId}
              collectionId={activeCollectionId}
              className="grid grid-cols-2 md:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-12"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="w-12 h-12 text-zinc-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <Text className="text-zinc-500 font-semibold text-sm">
                Bu kategoride henüz sergilenecek ürün bulunmuyor.
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Carousel Blocks placed Below Products */}
      {bannerCarouselsBelowProducts.map((item) => (
        <BannerCategoryCarousel key={item.block.id} bannerBlock={item.block} products={item.products} region={region} />
      ))}
      {carouselsBelowProducts.map((item) => (
        <ProductCarouselBlock key={item.block.id} block={item.block} products={item.products} region={region} />
      ))}

      {/* 5. Trust and Security Badges */}
      {config?.show_trust_badges !== false && <TrustBadges badges={config?.trust_badges} />}
    </>
  )
}
