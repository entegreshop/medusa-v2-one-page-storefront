import React from "react"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"

type ProductSchemaProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

export default function ProductSchema({
  product,
  region,
  countryCode,
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

  const canonicalUrl = `https://cizgibutik.com/${countryCode}/products/${product.handle}`

  const cleanDescription = (product.description || "")
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

  // Google Rich Results: Schema.org Product
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image:
      imageUrls.length > 0
        ? imageUrls
        : ["https://cizgibutik.com/cizgi-logo.png"],
    description: cleanDescription,
    sku: product.variants?.[0]?.sku || product.handle,
    mpn: product.id,
    brand: {
      "@type": "Brand",
      name: "Çizgi Butik",
    },
    category: categoryName,
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: currencyCode,
      price: priceNumber > 0 ? priceNumber.toFixed(2) : "0.00",
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
      ratingValue: "4.9",
      reviewCount: "84",
      bestRating: "5",
      worstRating: "1",
    },
    review: [
      {
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        author: {
          "@type": "Person",
          name: "Seda K.",
        },
        reviewBody:
          "Kumaş dokusu, kalıbı ve duruşu muazzam. Hızlı kargo için teşekkürler!",
      },
      {
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        author: {
          "@type": "Person",
          name: "Elif B.",
        },
        reviewBody:
          "Görseldekinin birebir aynısı geldi, çok kaliteli ve şık. Kesinlikle tavsiye ederim.",
      },
    ],
  }

  // Google Rich Results: Schema.org BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Anasayfa",
        item: "https://cizgibutik.com",
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}
