import { HttpTypes } from "@medusajs/types"

export type ReviewItem = {
  id: string
  no?: number
  product_id?: string
  product_title?: string
  customer_name: string
  color?: string
  size?: string
  rating: number
  comment: string
  media_url?: string
  media_type?: "image" | "video"
  media_urls?: string[]
  active?: boolean
  verified_purchase?: boolean
  helpful_count?: number
  created_at?: string
}

function hashString(input: string, salt = 0): number {
  let h = (2166136261 ^ salt) >>> 0
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h >>> 0
}

const FIRST_NAMES: string[] = [
  "Zeynep", "Elif", "Merve", "Büşra", "Ayşe", "Fatma", "Esra", "Gülşah",
  "Derya", "Pınar", "Sibel", "Özlem", "Gamze", "Tuğba", "Ebru", "Cansu",
  "Gizem", "Hande", "Selin", "Duygu", "Damla", "Burcu", "Yasemin", "Aslı",
  "Melis", "Şeyma", "Hilal", "Kübra", "Betül", "Neslihan", "Nihan", "Sevgi",
  "Sinem", "İrem", "Ceren", "Başak", "Didem", "Filiz", "Gonca", "Songül",
  "Gözde", "Ezgi", "Berna", "Sena", "Buse", "İlayda", "Ece", "Melike",
  "Nazlı", "Aleyna", "Bahar", "Melek", "Sümeyye", "Tülay", "Dilek", "Funda",
  "Hacer", "Aylin", "Nur", "Begüm", "Selen", "Sevde", "Esin", "Mine",
]

const SURNAME_TOKENS: string[] = [
  "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Yıldırım", "Öztürk",
  "Aydın", "Özdemir", "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara",
  "Koç", "Kurt", "Özkan", "Şimşek", "Polat", "Özcan", "Korkmaz", "Çakır",
  "Erdoğan", "Yavuz", "Can", "Acar", "Şen", "Aktaş", "Güler", "Yalçın",
  "Güneş", "Bozkurt", "Bulut", "Keskin", "Ünal", "Turan", "Gül", "Avcı",
  "Işık", "Kaplan", "Tekin", "Köse", "Yüksel", "Ateş", "Aksoy", "Coşkun",
  "Sarı", "Taş", "Uçar", "Bilir", "Duman", "Eren", "Ergin", "Gezer",
  "Mutlu", "Orhan", "Özer", "Sağlam", "Sönmez", "Taşkın", "Tunç", "Uysal",
]

function buildUniqueCustomerName(globalIndex: number): string {
  const firstIdx = globalIndex % FIRST_NAMES.length
  const surIdx = Math.floor(globalIndex / FIRST_NAMES.length) % SURNAME_TOKENS.length
  const formatMode = Math.floor(globalIndex / (FIRST_NAMES.length * 3)) % 3
  const firstName = FIRST_NAMES[firstIdx]
  const surname = SURNAME_TOKENS[(surIdx + firstIdx * 7) % SURNAME_TOKENS.length]

  if (formatMode === 0) {
    return `${firstName} ${surname.charAt(0)}.`
  }
  if (formatMode === 1) {
    return `${firstName} ${surname.slice(0, 2)}***`
  }
  return `${firstName} ${surname.charAt(0)}.`
}

type FashionItemType = {
  itemCategory: string
  featureWord: string
  fitWord: string
}

function detectFashionType(title: string, description = ""): FashionItemType {
  const t = (title + " " + description).toLowerCase()
  if (t.includes("takım") || t.includes("takim") || t.includes("kombin")) {
    return {
      itemCategory: "ikili takım",
      featureWord: "kumaş dökümü ve kombin uyumu",
      fitWord: "pantolon ve üst parçanın kalıbı",
    }
  }
  if (t.includes("elbise") || t.includes("abiye")) {
    return {
      itemCategory: "elbise",
      featureWord: "kumaşın zarafeti ve iç göstermemesi",
      fitWord: "bel ve omuz kalıbı",
    }
  }
  if (t.includes("jean") || t.includes("pantolon") || t.includes("palazzo") || t.includes("denim")) {
    return {
      itemCategory: "pantolon",
      featureWord: "kumaş esnekliği ve toparlayıcı yapısı",
      fitWord: "yüksek bel kesimi ve paça boyu",
    }
  }
  if (t.includes("ceket") || t.includes("blazer") || t.includes("trençkot") || t.includes("kaban") || t.includes("mont")) {
    return {
      itemCategory: "dış giyim",
      featureWord: "astar kalitesi ve tok duruşu",
      fitWord: "omuz ve kol kesimi",
    }
  }
  if (t.includes("gömlek") || t.includes("bluz") || t.includes("crop") || t.includes("tunik") || t.includes("body")) {
    return {
      itemCategory: "üst giyim",
      featureWord: "kumaş yumuşaklığı ve dökümlü yapısı",
      fitWord: "rahat kalıbı",
    }
  }
  return {
    itemCategory: "parça",
    featureWord: "kumaş kalitesi ve duruşu",
    fitWord: "kalıbı",
  }
}

const POSITIVE_OPENERS = [
  "Gerçekten harika bir ürün,",
  "Kargom beklediğimden çok daha hızlı geldi,",
  "Kumaş dokusuna tek kelimeyle bayıldım,",
  "Paketleme çok özenliydi ve mis kokulu geldi,",
  "Fotoğraflardakinden bile çok daha şık duruyor,",
  "Tam aradığım kalite ve zarafette,",
  "Çizgi Butik kalitesi yine yanıltmadı,",
  "Kalıbı vücuda o kadar güzel oturuyor ki,",
  "Siparişim ertesi gün elimdeydi,",
  "Kumaşı o kadar yumuşak ve kaliteli ki,",
]

const POSITIVE_CLOSERS = [
  "Dolabımın en favori kurtarıcı parçası oldu, kesinlikle tavsiye ederim.",
  "Başka renklerini de hemen sipariş verdim, çok teşekkürler Çizgi Butik!",
  "Fiyatını sonuna kadar hak eden çok kaliteli bir model, gönül rahatlığıyla alabilirsiniz.",
  "Dikişleri muntazam, kumaşı iç göstermiyor; çok memnun kaldım.",
  "Hem günlük hem özel davetlerde çok rahat kombinleniyor, tavsiye ederim.",
  "Kendi bedeninizi tam alabilirsiniz, üzerinizde kusursuz duruyor.",
  "Kapıda ödeme kolaylığı ve hızlı kargo için satıcıya çok teşekkür ederim.",
  "Her giydiğimde nereden aldığımı soruyorlar, kesinlikle 10/10 bir ürün.",
]

function buildReviewDate(baseSeed: number, idx: number): string {
  const daysAgo = 2 + ((baseSeed + idx * 7) % 38)
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

export function generateUniqueProductReviews(
  product: HttpTypes.StoreProduct
): ReviewItem[] {
  if (!product || !product.id) return []

  const productKey = product.handle || product.id
  const baseSeed = hashString(productKey)
  const fashion = detectFashionType(product.title || "", product.description || "")

  // Extract real available options for badge (e.g. S, M, L, Siyah, Bej, Ekru)
  const optionValues: string[] = []
  if (product.options && Array.isArray(product.options)) {
    for (const opt of product.options) {
      if (opt.values && Array.isArray(opt.values)) {
        for (const v of opt.values) {
          const val = typeof v === "string" ? v : (v as any)?.value
          if (val && !optionValues.includes(val)) {
            optionValues.push(val)
          }
        }
      }
    }
  }

  // Distinct image URLs for reviewer photos
  const distinctImageUrls: string[] = []
  if (product.thumbnail) distinctImageUrls.push(product.thumbnail)
  if (product.images && Array.isArray(product.images)) {
    for (const img of product.images) {
      if (img.url && !distinctImageUrls.includes(img.url)) {
        distinctImageUrls.push(img.url)
      }
    }
  }

  // Count of reviews: 7 to 12 reviews
  const count = 7 + (baseSeed % 6)
  const reviews: ReviewItem[] = []

  for (let idx = 0; idx < count; idx++) {
    const revSeed = hashString(`${productKey}_rev_${idx}`, baseSeed)
    const customerName = buildUniqueCustomerName(baseSeed + idx * 19)

    // Rating: Mostly 5 stars, occasional 4 stars for authentic 4.8 - 4.9 average
    let rating = 5
    if (idx === 2 && (revSeed % 3) === 0) {
      rating = 4
    } else if (idx === 5 && (revSeed % 4) === 0) {
      rating = 4
    }

    const openerIdx = ((baseSeed % POSITIVE_OPENERS.length) + idx * 5) % POSITIVE_OPENERS.length
    const closerIdx =
      ((Math.floor(baseSeed / POSITIVE_OPENERS.length) % POSITIVE_CLOSERS.length) + idx * 7) %
      POSITIVE_CLOSERS.length

    const middleVariants = [
      `kumaş kalitesi ve ${fashion.featureWord} beklentimin çok üstünde çıktı,`,
      `tam kalıp üretilmiş, ${fashion.fitWord} harika durdu,`,
      `rengi fotoğraftakinin aynısı ve ${fashion.featureWord} gerçekten çok kaliteli,`,
      `dikişleri son derece düzgün ve ${fashion.itemCategory} olarak çok asil duruyor,`,
      `${fashion.fitWord} sayesinde üzerimde tam istediğim gibi oturdu,`,
      `kumaşı yumuşacık ve nefes alan yapıda, ${fashion.featureWord} çok başarılı,`,
    ]
    const midIdx = ((baseSeed >>> 3) + idx * 3) % middleVariants.length
    const commentText = `${POSITIVE_OPENERS[openerIdx]} ${middleVariants[midIdx]} ${POSITIVE_CLOSERS[closerIdx]}`

    // Option badge (size / color)
    let optionBadge = "STANDART"
    if (optionValues.length > 0) {
      optionBadge = optionValues[(revSeed + idx) % optionValues.length].toUpperCase()
    }

    // Attach distinct product photo only to review 0 and 1
    let mediaUrl = ""
    if (idx === 0 && distinctImageUrls.length >= 1) {
      mediaUrl = distinctImageUrls[0]
    } else if (idx === 1 && distinctImageUrls.length >= 2) {
      mediaUrl = distinctImageUrls[1]
    }

    reviews.push({
      id: `rev_cizgi_${productKey}_${idx}`,
      product_id: product.id,
      product_title: product.title || "",
      customer_name: customerName,
      color: optionBadge,
      rating,
      comment: commentText,
      media_url: mediaUrl,
      media_type: "image",
      verified_purchase: true,
      helpful_count: 2 + ((revSeed >>> 3) % 15),
      created_at: buildReviewDate(baseSeed, idx),
    })
  }

  return reviews
}

export function getProductReviewSummary(product: HttpTypes.StoreProduct): {
  count: number
  averageRating: string
} {
  const list = generateUniqueProductReviews(product)
  const count = list.length
  const avg =
    count > 0
      ? (list.reduce((acc, r) => acc + Number(r.rating || 5), 0) / count).toFixed(1)
      : "4.9"
  return { count, averageRating: avg }
}
