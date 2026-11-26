import React from "react"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import {
  generateUniqueProductReviews,
  getProductReviewSummary,
} from "../product-reviews/generate-product-reviews"

type ProductSchemaProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

export default function ProductSchema({
  product,
  region,
  countryCode = "tr",
}: ProductSchemaProps) {
  if (!product || !product.id) return null

  let priceNumber = 0
  let currencyCode = "TRY"

  try {
    const priceData = getProductPrice({ product })
    if (priceData?.cheapestPrice?.calculated_price_number) {
      priceNumber = priceData.cheapestPrice.calculated_price_number
      currencyCode = priceData.cheapestPrice.currency_code?.toUpperCase() || "TRY"
    } else if (
      (product.variants?.[0] as any)?.calculated_price?.calculated_amount
    ) {
      priceNumber = (product.variants![0] as any).calculated_price.calculated_amount
      currencyCode =
        (product.variants![0] as any).calculated_price.currency_code?.toUpperCase() || "TRY"
    }
  } catch (e) {
    // Fallback if price parsing encounters any edge cases
  }

  // Medusa stores amounts in minor currency units (cents/kuruş, e.g. 79900 = 799.00 TL)
  // Ensure the schema price is in major currency units matching the page display
  let finalPrice = priceNumber
  if (finalPrice > 0) {
    if (finalPrice >= 1000) {
      finalPrice = finalPrice / 100
    }
  }

  const canonicalUrl = `https://cizgibutik.com/${countryCode}/products/${product.handle}`

  const cleanDescription =
    (product.description || "")
      .replace(/<[^>]*>?/gm, " ")
      .replace(/src="[^"]*"/gi, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 320) ||
    `${product.title} en uygun fiyat, kapıda ödeme ve hızlı kargo avantajıyla Çizgi Butik'te. Yeni sezon kadın giyim kombinlerini hemen keşfedin.`

  const imageUrls = [
    product.thumbnail,
    ...(product.images?.map((img) => img.url) || []),
  ].filter(Boolean) as string[]

  const categoryName =
    (product as any).categories?.[0]?.name ||
    (product as any).collection?.title ||
    "Kadın Giyim"
  const categoryHandle =
    (product as any).categories?.[0]?.handle ||
    (product as any).collection?.handle ||
    "kadin-giyim"

  const sku =
    product.variants?.[0]?.sku ||
    (product.metadata as any)?.sku ||
    `CZG-${product.id.slice(0, 8).toUpperCase()}`

  const reviewSummary = getProductReviewSummary(product)
  const reviewsList = generateUniqueProductReviews(product)

  // 1. Google Rich Results: Schema.org Product
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${canonicalUrl}#product`,
    name: product.title,
    url: canonicalUrl,
    image:
      imageUrls.length > 0
        ? imageUrls
        : ["https://cizgibutik.com/cizgi-logo.png"],
    description: cleanDescription,
    sku: sku,
    mpn: sku,
    brand: {
      "@type": "Brand",
      name: "Çizgi Butik",
    },
    category: categoryName,
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: currencyCode,
      price: finalPrice > 0 ? finalPrice.toFixed(2) : "0.00",
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Çizgi Butik",
        url: "https://cizgibutik.com",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0.00",
          currency: currencyCode,
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "TR",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "TR",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: reviewSummary.averageRating,
      reviewCount: String(reviewSummary.count),
      bestRating: "5",
      worstRating: "1",
    },
    review: reviewsList.map((rev) => {
      let datePublished = new Date().toISOString().split("T")[0]
      if (rev.created_at && rev.created_at.includes(".")) {
        const parts = rev.created_at.split(".")
        if (parts.length === 3) {
          datePublished = `${parts[2]}-${parts[1]}-${parts[0]}`
        }
      }
      return {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: rev.customer_name,
        },
        datePublished,
        reviewRating: {
          "@type": "Rating",
          ratingValue: rev.rating,
          bestRating: "5",
          worstRating: "1",
        },
        reviewBody: rev.comment,
      }
    }),
  }

  // 2. Google Rich Results: Schema.org BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Anasayfa",
        item: "https://cizgibutik.com/tr",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: `https://cizgibutik.com/${countryCode}/categories/${categoryHandle}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: canonicalUrl,
      },
    ],
  }

  // 3. Google Rich Results: Schema.org FAQPage (Rich expandable Q&A in Google Search)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${product.title} kalıbı nasıldır, hangi bedeni tercih etmeliyim?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Çizgi Butik ürünlerimiz standart Türk beden ölçülerine uygun tam kalıp olarak hazırlanmaktadır. Kendi standart bedeninizi güvenle sipariş verebilirsiniz. Dökümlü ve rahat bir duruş isterseniz ara bedenlerde bir üst bedeni tercih etmeniz önerilir.`,
        },
      },
      {
        "@type": "Question",
        name: "Kumaş kalitesi ve ürün özellikleri nasıldır?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Ürünümüz 1. sınıf kaliteli kumaş ve özenli dikiş işçiliği ile hazırlanmıştır. Nefes alan, terletmeyen ve iç göstermeyen yapısıyla gün boyu yüksek konfor sunar. 30 derecede hassas yıkama önerilir.`,
        },
      },
      {
        "@type": "Question",
        name: "Siparişim ne zaman kargolanır ve kapıda ödeme var mı?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Hafta içi saat 16:00'a kadar verilen siparişler aynı gün, diğer siparişler 1–2 iş günü içerisinde özenle paketlenerek kargoya teslim edilir. Kapıda nakit veya kredi kartıyla güvenli ödeme seçeneğimiz bulunmaktadır.`,
        },
      },
      {
        "@type": "Question",
        name: "Değişim veya iade imkanı var mı?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Evet. Çizgi Butik güvencesiyle 14 gün içerisinde kolay değişim ve iade hakkınız mevcuttur. Müşteri destek hattımız veya WhatsApp üzerinden anında destek alabilirsiniz.`,
        },
      },
    ],
  }

  const allSchemas = [productSchema, breadcrumbSchema, faqSchema]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(allSchemas) }}
    />
  )
}
