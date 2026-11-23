/**
 * Attribution & Visitor Traffic Source Tracker for Çizgi Butik
 * Tracks real referrer, search engine, social ads, UTM parameters, device type, and session duration.
 */

export interface VisitorAttribution {
  traffic_source: string
  referrer: string
  device_type: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_term: string
  utm_content: string
  session_start: number
  ip_address?: string
}

const STORAGE_KEY = "cb_attribution_data"
const SESSION_START_KEY = "cb_session_start_time"

export function detectDevice(): string {
  if (typeof window === "undefined" || !navigator) return "Masaüstü"
  const ua = navigator.userAgent || ""

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  const isIOS = /iPhone|iPad|iPod/i.test(ua)
  const isAndroid = /Android/i.test(ua)
  const isWindows = /Windows/i.test(ua)
  const isMac = /Macintosh/i.test(ua)

  let browser = "Tarayıcı"
  if (/Edg/i.test(ua)) browser = "Edge"
  else if (/Chrome/i.test(ua) && !/Edg|OPR/i.test(ua)) browser = "Chrome"
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari"
  else if (/Firefox/i.test(ua)) browser = "Firefox"
  else if (/Instagram/i.test(ua)) browser = "Instagram App"
  else if (/FBAN|FBAV/i.test(ua)) browser = "Facebook App"

  if (isIOS) return `Akıllı Telefon - iOS - ${browser}`
  if (isAndroid) return `Akıllı Telefon - Android - ${browser}`
  if (isMobile) return `Mobil - ${browser}`
  if (isWindows) return `Masaüstü - Windows - ${browser}`
  if (isMac) return `Masaüstü - macOS - ${browser}`
  return `Masaüstü - ${browser}`
}

export function recordVisitorAttribution(): VisitorAttribution {
  if (typeof window === "undefined") {
    return {
      traffic_source: "Doğrudan (Direct)",
      referrer: "Doğrudan Giriş",
      device_type: "Masaüstü",
      utm_source: "-",
      utm_medium: "-",
      utm_campaign: "-",
      utm_term: "-",
      utm_content: "-",
      session_start: Date.now(),
    }
  }

  // 1. Session start time
  let sessionStart = Number(sessionStorage.getItem(SESSION_START_KEY) || 0)
  if (!sessionStart || isNaN(sessionStart)) {
    sessionStart = Date.now()
    sessionStorage.setItem(SESSION_START_KEY, String(sessionStart))
  }

  // 2. Read query parameters
  const sp = new URLSearchParams(window.location.search)
  const utm_source = sp.get("utm_source") || ""
  const utm_medium = sp.get("utm_medium") || ""
  const utm_campaign = sp.get("utm_campaign") || ""
  const utm_term = sp.get("utm_term") || ""
  const utm_content = sp.get("utm_content") || ""
  const gclid = sp.get("gclid") || ""
  const fbclid = sp.get("fbclid") || ""
  const ttclid = sp.get("ttclid") || ""

  // 3. Read referrer
  const ref = document.referrer || ""
  let traffic_source = "Doğrudan (Direct)"
  let referrerDisplay = "Doğrudan Giriş"

  const hasUtm = Boolean(utm_source || utm_medium || utm_campaign || gclid || fbclid || ttclid)

  if (ref) {
    try {
      const refUrl = new URL(ref)
      const host = refUrl.hostname.toLowerCase()
      referrerDisplay = host

      if (host.includes("google")) {
        if (gclid || utm_medium.toLowerCase().includes("cpc") || utm_medium.toLowerCase().includes("paid")) {
          traffic_source = "Google Reklamları (cpc)"
        } else {
          traffic_source = "Google (Organik Arama)"
        }
      } else if (host.includes("instagram")) {
        if (fbclid || utm_medium.toLowerCase().includes("paid") || utm_medium.toLowerCase().includes("cpc")) {
          traffic_source = "Instagram Reklamı"
        } else {
          traffic_source = "Instagram (Sosyal Ağ)"
        }
      } else if (host.includes("facebook")) {
        if (fbclid || utm_medium.toLowerCase().includes("paid") || utm_medium.toLowerCase().includes("cpc")) {
          traffic_source = "Facebook Reklamı"
        } else {
          traffic_source = "Facebook (Sosyal Ağ)"
        }
      } else if (host.includes("tiktok")) {
        traffic_source = ttclid ? "TikTok Reklamı" : "TikTok"
      } else if (host.includes("youtube")) {
        traffic_source = "YouTube"
      } else if (host.includes("yandex")) {
        traffic_source = "Yandex Arama"
      } else if (host.includes("bing")) {
        traffic_source = "Bing Arama"
      } else if (host !== window.location.hostname) {
        traffic_source = `Yönlendirme (${host})`
      }
    } catch {
      referrerDisplay = ref
    }
  } else if (hasUtm) {
    if (utm_source.toLowerCase().includes("meta") || utm_source.toLowerCase().includes("facebook") || utm_source.toLowerCase().includes("instagram")) {
      traffic_source = "Instagram / Meta Reklamı"
      referrerDisplay = "instagram.com"
    } else if (utm_source.toLowerCase().includes("google")) {
      traffic_source = "Google Reklamları"
      referrerDisplay = "google.com"
    } else if (gclid) {
      traffic_source = "Google Reklamları (cpc)"
      referrerDisplay = "google.com"
    } else if (fbclid) {
      traffic_source = "Instagram / Facebook"
      referrerDisplay = "instagram.com"
    } else {
      traffic_source = `${utm_source} / ${utm_medium || "kampanya"}`
      referrerDisplay = utm_source
    }
  }

  const device = detectDevice()

  // Check existing saved attribution to preserve initial touchpoint within session
  let existing: VisitorAttribution | null = null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY)
    if (raw) existing = JSON.parse(raw)
  } catch {}

  // If already recorded and current is direct/internal, keep previous attribution
  if (existing && !hasUtm && (!ref || ref.includes(window.location.hostname))) {
    existing.session_start = sessionStart
    return existing
  }

  const attribution: VisitorAttribution = {
    traffic_source: traffic_source,
    referrer: referrerDisplay,
    device_type: device,
    utm_source: utm_source || existing?.utm_source || "-",
    utm_medium: utm_medium || existing?.utm_medium || "-",
    utm_campaign: utm_campaign || existing?.utm_campaign || "-",
    utm_term: utm_term || existing?.utm_term || "-",
    utm_content: utm_content || existing?.utm_content || "-",
    session_start: sessionStart,
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution))
  } catch {}

  return attribution
}

export function getAttributionForOrder(): Record<string, string> {
  if (typeof window === "undefined") {
    return {
      traffic_source: "Doğrudan (Direct)",
      referrer: "Doğrudan Giriş",
      device_type: "Masaüstü",
      session_duration: "01:00 dk",
      utm_source: "-",
      utm_medium: "-",
      utm_campaign: "-",
      utm_term: "-",
      utm_content: "-",
    }
  }

  let data: VisitorAttribution | null = null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY)
    if (raw) data = JSON.parse(raw)
  } catch {}

  if (!data) {
    data = recordVisitorAttribution()
  }

  const sessionStart = Number(sessionStorage.getItem(SESSION_START_KEY) || data.session_start || Date.now())
  const elapsedMs = Math.max(0, Date.now() - sessionStart)
  const totalSecs = Math.floor(elapsedMs / 1000)
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60
  const session_duration = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} dk`

  return {
    traffic_source: data.traffic_source || "Doğrudan (Direct)",
    referrer: data.referrer || "Doğrudan Giriş",
    device_type: data.device_type || detectDevice(),
    session_duration: session_duration,
    utm_source: data.utm_source || "-",
    utm_medium: data.utm_medium || "-",
    utm_campaign: data.utm_campaign || "-",
    utm_term: data.utm_term || "-",
    utm_content: data.utm_content || "-",
  }
}
