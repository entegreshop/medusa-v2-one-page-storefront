import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{
    v_id?: string
    RENK?: string
    renk?: string
    BEDEN?: string
    beden?: string
  }>
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
      .flatMap((countryData) =>
        countryData.products.map((product) => ({
          countryCode: countryData.country,
          handle: product.handle,
        }))
      )
      .filter((param) => param.handle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

function safeNormalize(str: string) {
  return str
    .replace(/İ/g, "i")
    .toLowerCase()
    .replace(/\u0307/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
}

function matchImageToColor(url: string, color: string) {
  const filename = url.split('/').pop()?.toLowerCase() || '';
  const normFilename = safeNormalize(filename);
  const normColor = safeNormalize(color);

  if (normFilename.includes(normColor)) {
    return true;
  }

  if (normColor === 'krem' && (normFilename.includes('bej') || normFilename.includes('cream') || normFilename.includes('krem'))) {
    return true;
  }
  if (normColor === 'bej' && (normFilename.includes('krem') || normFilename.includes('beige') || normFilename.includes('bej'))) {
    return true;
  }

  const parts = filename.split('-');
  const lastPart = parts[parts.length - 1];
  if (lastPart) {
    const code = lastPart.split('.')[0];
    
    if (normColor === 'kahve' && code.startsWith('k') && !code.startsWith('kr')) {
      return true;
    }
    if (normColor === 'siyah' && (code.startsWith('s') || code.startsWith('l'))) {
      return true;
    }
    if (normColor === 'krem' && (code.startsWith('kr') || code.startsWith('bej') || code.startsWith('b'))) {
      return true;
    }
    if (normColor === 'lacivert' && code.startsWith('l')) {
      return true;
    }
    if (normColor === 'antrasit' && code.startsWith('a')) {
      return true;
    }
    if (normColor === 'mavi' && code.startsWith('m')) {
      return true;
    }
  }

  return false;
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  if (!product.images || product.images.length === 0) {
    return []
  }

  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants.find((v) => v.id === selectedVariantId)
  if (!variant) {
    return product.images
  }

  const renkOption = product.options?.find((o) => {
    const t = safeNormalize(o.title || "")
    return t === "renk" || t === "color" || t === "colour"
  })

  if (!renkOption) {
    if (variant.images && variant.images.length > 0 && variant.images.length < product.images.length) {
      const imageIdsMap = new Map(variant.images.map((i) => [i.id, true]))
      return product.images.filter((i) => imageIdsMap.has(i.id))
    }
    return product.images
  }

  const variantRenkValue = variant.options?.find((opt: any) => opt.option_id === renkOption.id)?.value
  if (!variantRenkValue) {
    return product.images
  }

  // Yeni Sistem: Backend'den gelen metadata.image_colors haritasını kullan
  if (product.metadata?.image_colors) {
    const imageColors = product.metadata.image_colors as Record<string, string>;
    const exactMatches = product.images.filter((img) => {
      const imgColor = imageColors[img.url];
      return imgColor && safeNormalize(imgColor) === safeNormalize(variantRenkValue);
    });
    if (exactMatches.length > 0) {
      return exactMatches;
    }
  }

  // Eski Sistem (Geriye Uyumluluk): Dosya adından renk bulmaya çalış
  const matchedImages = product.images.filter((img) => {
    return img.url && matchImageToColor(img.url, variantRenkValue)
  })

  if (matchedImages.length > 0) {
    return matchedImages
  }

  return product.images
}

function findVariantIdByOptions(
  product: HttpTypes.StoreProduct,
  searchParams: {
    v_id?: string
    RENK?: string
    renk?: string
    BEDEN?: string
    beden?: string
  }
) {
  if (!product.variants) return undefined

  const renk = searchParams.RENK || searchParams.renk
  const beden = searchParams.BEDEN || searchParams.beden

  if (!renk && !beden) return undefined

  const renkOption = product.options?.find((o) => {
    const t = safeNormalize(o.title || "")
    return t === "renk" || t === "color" || t === "colour"
  })
  const bedenOption = product.options?.find((o) => {
    const t = safeNormalize(o.title || "")
    return t === "beden" || t === "size"
  })

  const match = product.variants.find((v) => {
    return v.options?.every((opt: any) => {
      if (renkOption && opt.option_id === renkOption.id) {
        if (!renk) return true
        return safeNormalize(opt.value || "") === safeNormalize(renk)
      }
      if (bedenOption && opt.option_id === bedenOption.id) {
        if (!beden) return true
        return safeNormalize(opt.value || "") === safeNormalize(beden)
      }
      return true
    })
  })

  return match?.id
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle, countryCode } = params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  const cleanDescription = (product.description || "")
    .replace(/<[^>]*>?/gm, " ")
    .replace(/src="[^"]*"/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 155)

  const metaDescription = cleanDescription
    ? `${cleanDescription} - Çizgi Butik'te en uygun fiyat, kapıda ödeme ve hızlı kargo avantajıyla hemen keşfedin!`
    : `${product.title} en uygun fiyat, kapıda ödeme ve hızlı kargo avantajıyla Çizgi Butik'te. Yeni sezon kadın giyim kombinlerini hemen sipariş verin.`

  const categoryName =
    (product as any).categories?.[0]?.name ||
    (product as any).collection?.title ||
    "Kadın Giyim"
  const pageTitle = `${product.title} - Fiyatı, Modelleri ve Yorumları | Çizgi Butik`
  const canonicalUrl = `https://cizgibutik.com/${countryCode}/products/${handle}`

  const imageUrl =
    product.thumbnail ||
    product.images?.[0]?.url ||
    "https://cizgibutik.com/cizgi-logo.png"

  return {
    title: pageTitle,
    description: metaDescription,
    keywords: [
      product.title,
      `${product.title} fiyatı`,
      `${product.title} modelleri`,
      `${product.title} satın al`,
      "kadın giyim",
      "yeni sezon",
      "butik giyim",
      "online butik",
      "kapıda ödeme",
      "hızlı kargo",
      "çizgi butik",
      categoryName,
    ].filter(Boolean) as string[],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "tr-TR": `https://cizgibutik.com/tr/products/${handle}`,
        "x-default": `https://cizgibutik.com/tr/products/${handle}`,
      },
    },
    openGraph: {
      title: `${product.title} | Çizgi Butik`,
      description: metaDescription,
      url: canonicalUrl,
      siteName: "Çizgi Butik",
      locale: "tr_TR",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 1067,
          alt: `${product.title} - Çizgi Butik Kadın Giyim`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | Çizgi Butik`,
      description: metaDescription,
      images: [imageUrl],
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
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: params.handle },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  let selectedVariantId = searchParams.v_id
  if (!selectedVariantId) {
    selectedVariantId = findVariantIdByOptions(pricedProduct, searchParams)
  }

  // XML entegrasyonlarında description içine devasa base64 görseller eklenebiliyor.
  // Bu durum Next.js RSC payload'unu MB'larca şişirerek tarayıcıyı donduruyor (donma sorunu).
  // Bunu engellemek için description içindeki base64 src verilerini temizleyelim.
  if (pricedProduct.description) {
    pricedProduct.description = pricedProduct.description.replace(
      /src="data:image\/[^;]+;base64,[^"]+"/gi,
      'src="" alt="Görsel boyutu nedeniyle gizlendi"'
    );
  } else {
    pricedProduct.description = `${pricedProduct.title}, Çizgi Butik yeni sezon kadın giyim koleksiyonunun en seçkin parçalarındandır. Kaliteli kumaş yapısı, zarif dikişleri ve rahat kalıbıyla hem günlük şıklığınızı hem de özel kombinlerinizi mükemmel şekilde tamamlar. Kapıda ödeme, hızlı kargo ve kolay değişim avantajıyla hemen sipariş verebilirsiniz.`;
  }

  if (pricedProduct.metadata) {
    for (const key of Object.keys(pricedProduct.metadata)) {
      if (typeof pricedProduct.metadata[key] === "string" && (pricedProduct.metadata[key] as string).length > 5000) {
        pricedProduct.metadata[key] = (pricedProduct.metadata[key] as string).substring(0, 5000) + "... (boyut nedeniyle kırpıldı)";
      }
    }
  }

  console.log("[ProductPage Server] searchParams:", searchParams);
  console.log("[ProductPage Server] selectedVariantId:", selectedVariantId);

  if (!region) {
    notFound()
  }

  const images = getImagesForVariant(pricedProduct, selectedVariantId) || []
  console.log("[ProductPage Server] filtered images count:", images.length, images.map(img => img.url));

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
      images={images}
    />
  )
}
