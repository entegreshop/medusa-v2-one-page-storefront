import HeroSlider, { SlideData } from "./hero-slider"

const BACKEND_FETCH_URL =
  process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.cizgibutik.com"
const PUBLIC_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL && !process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    : "https://api.cizgibutik.com"
const NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

async function getHeroConfig() {
  try {
    const headers: Record<string, string> = {}
    if (NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers["x-publishable-api-key"] = NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }

    const res = await fetch(`${BACKEND_FETCH_URL}/store/hero-config`, {
      cache: "no-store",
      headers,
    })
    const data = await res.json()
    return data?.config || null
  } catch (err) {
    console.error("Failed to fetch hero config in Storefront:", err)
    return null
  }
}

export function resolveHeroMediaUrl(url?: string) {
  if (!url) return ""
  const trimmed = url.trim()
  if (!trimmed || trimmed === "/uploads/hero-1774921088469-819611420.jpg") return ""

  const uploadsMatch = trimmed.match(/\/uploads\/([^?#]+)$/i)
  if (uploadsMatch && uploadsMatch[1]) {
    const filename = uploadsMatch[1]
    if (/\.(mp4|mov|webm|m4v)$/i.test(filename)) {
      return `/api/hero-media/${filename}`
    }
    return `${PUBLIC_BACKEND_URL}/uploads/${filename}`
  }

  return trimmed
    .replace(/^http:\/\/localhost:\d+/i, PUBLIC_BACKEND_URL)
    .replace(/^http:\/\/127\.0\.0\.1:\d+/i, PUBLIC_BACKEND_URL)
    .replace(/^http:\/\/api\.cizgibutik\.com/i, "https://api.cizgibutik.com")
}

function detectMediaType(explicitType?: string, url?: string, mobileUrl?: string): "image" | "video" {
  const candidate = url || mobileUrl || ""
  if (/\.(mp4|mov|webm|m4v)(\?|$)/i.test(candidate) || candidate.startsWith("/api/hero-media/")) {
    return "video"
  }
  return explicitType === "video" ? "video" : "image"
}

const Hero = async ({ dict, initialConfig }: { dict: any; initialConfig?: any }) => {
  const config = initialConfig || (await getHeroConfig())

  const rawTitle = config?.title || dict?.hero?.title || "Çizgi Butik'e Hoş Geldiniz"
  const cleanTitle = rawTitle === "XOOX Mağazasına Hoş Geldiniz" ? "Çizgi Butik'e Hoş Geldiniz" : rawTitle

  const resolvedDesktopUrl = resolveHeroMediaUrl(config?.media_url)
  const resolvedMobileUrl = resolveHeroMediaUrl(config?.mobile_media_url)

  const primarySlide: SlideData = {
    tag:
      config?.tag === "MEDUSA V2 × NEXT.JS"
        ? "2026 YENİ SEZON KOLEKSİYONU"
        : config?.tag || "2026 YENİ SEZON KOLEKSİYONU",
    title: cleanTitle,
    subtitle:
      config?.subtitle ||
      dict?.hero?.subtitle ||
      "Yeni sezonun en trend kadın giyim, jean, tayt ve kombin modellerini hemen keşfedin",
    btn_text: config?.btn_text || dict?.hero?.cta || "Şimdi Alışverişe Başla",
    btn_link: config?.btn_link || "/store",
    media_type: detectMediaType(config?.media_type, resolvedDesktopUrl, resolvedMobileUrl),
    media_url: resolvedDesktopUrl,
    mobile_media_url: resolvedMobileUrl,
  }

  const extraSlides: SlideData[] = Array.isArray(config?.hero_slides)
    ? config.hero_slides
        .filter((s: any) => s && s.active !== false)
        .map((s: any) => {
          const sDesktop = resolveHeroMediaUrl(s.media_url)
          const sMobile = resolveHeroMediaUrl(s.mobile_media_url)
          return {
            ...s,
            media_type: detectMediaType(s.media_type, sDesktop, sMobile),
            media_url: sDesktop,
            mobile_media_url: sMobile,
          }
        })
    : []

  const allSlides = [primarySlide, ...extraSlides]

  return (
    <HeroSlider
      slides={allSlides}
      height={config?.hero_height || "75vh"}
      overlayOpacity={config?.hero_overlay_opacity ?? 15}
      btnBg={config?.hero_btn_bg || "#7C3AED"}
      btnTextColor={config?.hero_btn_text_color || "#ffffff"}
      autoplay={config?.hero_autoplay ?? true}
      interval={config?.hero_interval || 5000}
    />
  )
}

export default Hero
