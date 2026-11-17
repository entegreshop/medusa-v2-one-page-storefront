"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button, Heading } from "@medusajs/ui"
import Link from "next/link"

export interface SlideData {
  tag: string
  title: string
  subtitle: string
  btn_text: string
  btn_link: string
  media_type: "image" | "video"
  media_url: string
  mobile_media_url?: string
}

const PUBLIC_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL && !process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    : "https://api.cizgibutik.com"

function normalizePublicMediaUrl(url?: string) {
  if (!url) return ""
  const trimmed = url.trim()
  if (!trimmed || trimmed === "/uploads/hero-1774921088469-819611420.jpg") return ""

  if (trimmed.startsWith("/api/hero-media/")) {
    return trimmed
  }

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

function getDirectBackendVideoUrl(url?: string) {
  if (!url) return ""
  const mediaMatch = url.match(/\/api\/hero-media\/([^?#]+)$/i)
  if (mediaMatch && mediaMatch[1]) {
    return `${PUBLIC_BACKEND_URL}/uploads/${mediaMatch[1]}`
  }
  return url
}

function isVideoMedia(mediaType?: string, url?: string) {
  if (!url) return false
  if (/\.(mp4|mov|webm|m4v)(\?|$)/i.test(url) || url.startsWith("/api/hero-media/")) return true
  return mediaType === "video"
}

export default function HeroSlider({
  slides: initialSlides,
  height = "75vh",
  overlayOpacity = 15,
  btnBg = "#7C3AED",
  btnTextColor = "#ffffff",
  autoplay = true,
  interval = 5000,
}: {
  slides: SlideData[]
  height?: string
  overlayOpacity?: number
  btnBg?: string
  btnTextColor?: string
  autoplay?: boolean
  interval?: number
}) {
  const [slides, setSlides] = useState<SlideData[]>(initialSlides)
  const [current, setCurrent] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({})
  const [failedImageUrls, setFailedImageUrls] = useState<Record<string, boolean>>({})
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const blobLoadingRef = useRef<Record<string, boolean>>({})

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkViewport()
    window.addEventListener("resize", checkViewport)
    return () => window.removeEventListener("resize", checkViewport)
  }, [])

  // Only update slides from /store/hero-config if the server-rendered slides had no media_url or changed
  useEffect(() => {
    const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
    const headers: Record<string, string> = {}
    if (pubKey) headers["x-publishable-api-key"] = pubKey

    fetch(`${PUBLIC_BACKEND_URL}/store/hero-config`, { headers, cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const cfg = data?.config
        if (!cfg) return
        const dUrl = normalizePublicMediaUrl(cfg.media_url)
        const mUrl = normalizePublicMediaUrl(cfg.mobile_media_url)
        const primary: SlideData = {
          tag: cfg.tag || initialSlides[0]?.tag || "2026 YENİ SEZON KOLEKSİYONU",
          title: cfg.title || initialSlides[0]?.title || "Çizgi Butik'e Hoş Geldiniz",
          subtitle: cfg.subtitle || initialSlides[0]?.subtitle || "",
          btn_text: cfg.btn_text || initialSlides[0]?.btn_text || "Şimdi Alışverişe Başla",
          btn_link: cfg.btn_link || initialSlides[0]?.btn_link || "/store",
          media_type: isVideoMedia(cfg.media_type, dUrl || mUrl) ? "video" : "image",
          media_url: dUrl,
          mobile_media_url: mUrl,
        }
        const extras: SlideData[] = Array.isArray(cfg.hero_slides)
          ? cfg.hero_slides
              .filter((s: any) => s && s.active !== false)
              .map((s: any) => {
                const sd = normalizePublicMediaUrl(s.media_url)
                const sm = normalizePublicMediaUrl(s.mobile_media_url)
                return {
                  ...s,
                  media_type: isVideoMedia(s.media_type, sd || sm) ? "video" : "image",
                  media_url: sd,
                  mobile_media_url: sm,
                }
              })
          : []
        const nextSlides = [primary, ...extras]
        setSlides((prev) => {
          const prevKey = prev.map((s) => `${s.media_url}|${s.mobile_media_url}|${s.title}`).join(";;")
          const nextKey = nextSlides.map((s) => `${s.media_url}|${s.mobile_media_url}|${s.title}`).join(";;")
          return prevKey === nextKey ? prev : nextSlides
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!autoplay || slides.length <= 1) return
    const timer = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, interval)
    return () => window.clearInterval(timer)
  }, [autoplay, interval, slides.length])

  const slide = slides[current] || slides[0]

  const desktopUrl = normalizePublicMediaUrl(slide?.media_url)
  const mobileUrl = normalizePublicMediaUrl(slide?.mobile_media_url)
  const activeMediaUrl = isMobile && mobileUrl ? mobileUrl : desktopUrl || mobileUrl
  const activeIsVideo = isVideoMedia(slide?.media_type, activeMediaUrl)
  const hasValidMedia = Boolean(
    activeMediaUrl && (activeIsVideo || !failedImageUrls[activeMediaUrl])
  )
  const effectiveVideoSrc = blobUrls[activeMediaUrl] || activeMediaUrl

  // Fallback helper: if native <video> range streaming stalls or errors on iOS/Chrome, fetch as Blob and play from memory
  const loadVideoAsBlobFallback = (mediaKey: string) => {
    if (!mediaKey || blobUrls[mediaKey] || blobLoadingRef.current[mediaKey]) return
    blobLoadingRef.current[mediaKey] = true

    const candidates = [mediaKey, getDirectBackendVideoUrl(mediaKey)].filter(Boolean)
    ;(async () => {
      for (const candidateUrl of Array.from(new Set(candidates))) {
        try {
          const resp = await fetch(candidateUrl)
          if (resp.ok) {
            const buf = await resp.arrayBuffer()
            if (buf.byteLength > 1000) {
              const blob = new Blob([buf], { type: "video/mp4" })
              const objUrl = URL.createObjectURL(blob)
              setBlobUrls((prev) => ({ ...prev, [mediaKey]: objUrl }))
              return
            }
          }
        } catch {}
      }
    })()
  }

  // Ensure Chrome & iOS Safari auto-play muted inline video reliably
  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl || !hasValidMedia || !activeIsVideo) return

    videoEl.defaultMuted = true
    videoEl.muted = true
    videoEl.playsInline = true
    videoEl.setAttribute("muted", "")
    videoEl.setAttribute("playsinline", "true")
    videoEl.setAttribute("webkit-playsinline", "true")

    const attemptPlay = () => {
      if (!videoEl) return
      videoEl.muted = true
      const p = videoEl.play()
      if (p && typeof p.catch === "function") {
        p.catch(() => {})
      }
    }

    attemptPlay()
    videoEl.addEventListener("loadedmetadata", attemptPlay)
    videoEl.addEventListener("loadeddata", attemptPlay)
    videoEl.addEventListener("canplay", attemptPlay)

    // If video hasn't loaded any metadata within 1500ms (e.g. CDN/Range issue), trigger Blob fallback
    const fallbackTimer = window.setTimeout(() => {
      if (videoEl && videoEl.readyState === 0 && !blobUrls[activeMediaUrl]) {
        loadVideoAsBlobFallback(activeMediaUrl)
      } else if (videoEl && videoEl.paused) {
        attemptPlay()
      }
    }, 1500)

    const onFirstTouch = () => {
      if (videoEl && videoEl.paused) {
        attemptPlay()
      }
    }
    window.addEventListener("touchstart", onFirstTouch, { passive: true, once: true })

    return () => {
      window.clearTimeout(fallbackTimer)
      videoEl.removeEventListener("loadedmetadata", attemptPlay)
      videoEl.removeEventListener("loadeddata", attemptPlay)
      videoEl.removeEventListener("canplay", attemptPlay)
      window.removeEventListener("touchstart", onFirstTouch)
    }
  }, [effectiveVideoSrc, activeMediaUrl, activeIsVideo, hasValidMedia, current])

  if (!slide) return null

  return (
    <div
      className="w-full relative bg-zinc-900 overflow-hidden border-b border-zinc-200 transition-all duration-500"
      style={{ height }}
    >
      {hasValidMedia ? (
        <>
          {activeIsVideo ? (
            <video
              key={effectiveVideoSrc}
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onError={() => loadVideoAsBlobFallback(activeMediaUrl)}
              className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
              src={effectiveVideoSrc}
            />
          ) : (
            <picture>
              {mobileUrl && <source media="(max-width: 767px)" srcSet={mobileUrl} />}
              <img
                className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500"
                src={desktopUrl || mobileUrl}
                alt={slide.title || "Hero Banner"}
                onError={() => setFailedImageUrls((prev) => ({ ...prev, [activeMediaUrl]: true }))}
              />
            </picture>
          )}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{ backgroundColor: `rgba(0,0,0,${Math.min(0.75, Math.max(0.15, (overlayOpacity ?? 15) / 100))})` }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-zinc-50 z-0">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
        </div>
      )}

      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center px-6 small:p-32 gap-6">
        {slide.tag && (
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-violet-500/20 bg-white/90 text-violet-700 text-xs font-semibold tracking-wider uppercase shadow-2xs">
            {slide.tag}
          </span>
        )}

        <span className="flex flex-col gap-3 max-w-3xl">
          <Heading
            level="h1"
            className={`text-4xl md:text-6xl font-bold tracking-tight font-sans leading-tight ${
              hasValidMedia ? "text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]" : "text-zinc-950"
            }`}
          >
            {slide.title}
          </Heading>
          {slide.subtitle && (
            <p
              className={`text-base md:text-xl font-medium max-w-xl mx-auto leading-relaxed ${
                hasValidMedia ? "text-zinc-100 drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]" : "text-zinc-700"
              }`}
            >
              {slide.subtitle}
            </p>
          )}
        </span>

        {slide.btn_text && (
          <div className="mt-2">
            <Link href={slide.btn_link || "/store"}>
              <Button
                className="font-semibold px-8 py-3.5 rounded-xl shadow-[0_8px_20px_-4px_rgba(124,58,237,0.4)] transition-all duration-300 text-base border-none cursor-pointer hover:opacity-95"
                style={{ backgroundColor: btnBg, color: btnTextColor }}
              >
                {slide.btn_text}
              </Button>
            </Link>
          </div>
        )}

        {slides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrent(idx)}
                aria-label={`Slayt ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  idx === current
                    ? hasValidMedia
                      ? "w-8 bg-white"
                      : "w-8 bg-zinc-900"
                    : hasValidMedia
                    ? "w-2.5 bg-white/60 hover:bg-white"
                    : "w-2.5 bg-zinc-400/60 hover:bg-zinc-600"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
