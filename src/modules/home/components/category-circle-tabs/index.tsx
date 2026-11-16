"use client"

import React, { useRef, useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export interface CircleCategoryConfig {
  name: string
  handle: string
  icon?: string
  active?: boolean
}

const DEFAULT_CIRCLE_CATEGORIES: CircleCategoryConfig[] = [
  {
    name: "JEAN PANTOLON",
    handle: "jean-pantolon",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10l1.5 16h-4.5L12 9l-2 11H5.5L7 4z"/><path d="M7 7h10"/><path d="M9 4v3"/><path d="M15 4v3"/></svg>`,
  },
  {
    name: "TAYT",
    handle: "tayt",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8l1 16h-3.5L12 9.5 10.5 20H7.0L8 4z"/><path d="M8 7.5h8"/></svg>`,
  },
  {
    name: "SWEAT",
    handle: "sweat",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l-3 3.5L5.5 15l1.5-2v6.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5V13l1.5 2 2.5-2.5L18 9V6a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v3z"/><path d="M9 10a3 3 0 0 0 6 0"/><path d="M12 3v5"/></svg>`,
  },
  {
    name: "MONT & KÜRK",
    handle: "mont",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a3 3 0 0 0-3-3h-2L12 3.5 10 5H8a3 3 0 0 0-3 3z"/><path d="M12 3.5V21"/><path d="M5 9h14"/><path d="M5 13h14"/><path d="M5 17h14"/></svg>`,
  },
  {
    name: "KOMBİN",
    handle: "kombin",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a2 2 0 0 0-2 2c0 .5.2.9.5 1.2L5 8.5v3l4.5 1V19A1.5 1.5 0 0 0 11 20.5h2a1.5 1.5 0 0 0 1.5-1.5v-6.5l4.5-1v-3L13.5 6.2c.3-.3.5-.7.5-1.2a2 2 0 0 0-2-2z"/><path d="M8 8.5V17"/><path d="M16 8.5V17"/></svg>`,
  },
  {
    name: "TSHIRT",
    handle: "tshirt",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5.5L3.5 8 5.5 11l2-1.5v10.0A1.5 1.5 0 0 0 9 21h6a1.5 1.5 0 0 0 1.5-1.5V9.5l2 1.5 2-3L18 5.5V3.5a1.5 1.5 0 0 0-1.5-1.5h-9A1.5 1.5 0 0 0 6 3.5v2.0z"/><path d="M9.5 2h5A2.5 2.5 0 0 1 12 4.5 2.5 2.5 0 0 1 9.5 2z"/></svg>`,
  },
  {
    name: "GÖZLÜK",
    handle: "gozluk",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11a3 3 0 0 1 3-3h3.5a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v0z"/><path d="M11.5 11a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3h-3.5a3 3 0 0 1-3-3v0z"/><path d="M9.5 11h2.5"/><path d="M3 11.5c.5-3 2-4.5 3.5-4.5"/><path d="M21 11.5c-.5-3-2-4.5-3.5-4.5"/></svg>`,
  },
  {
    name: "ÇANTA",
    handle: "canta",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l1 11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2L5 8z"/><path d="M9 8V5.5a3 3 0 0 1 6 0V8"/></svg>`,
  },
]

export default function CategoryCircleTabs({
  categories,
  activeCategory,
}: {
  categories?: CircleCategoryConfig[]
  activeCategory?: string
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const baseCategories =
    Array.isArray(categories) && categories.length > 0 ? categories : DEFAULT_CIRCLE_CATEGORIES

  const filteredDynamic = baseCategories.filter(
    (c) => c && c.handle !== "yeni-gelenler" && c.handle !== "cok-satanlar" && c.active !== false
  )

  const allTabs: CircleCategoryConfig[] = [
    {
      name: "YENİ GELENLER",
      handle: "yeni-gelenler",
      icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143z" /></svg>`,
    },
    {
      name: "ÇOK SATANLAR",
      handle: "cok-satanlar",
      icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
    },
    ...filteredDynamic.map((cat) => {
      const fallback = DEFAULT_CIRCLE_CATEGORIES.find((d) => d.handle === cat.handle)
      return {
        ...cat,
        icon: cat.icon || fallback?.icon || DEFAULT_CIRCLE_CATEGORIES[0].icon,
      }
    }),
  ]

  const checkScrollLimits = () => {
    const el = scrollContainerRef.current
    if (!el) return
    setShowLeftArrow(el.scrollLeft > 5)
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 5)
  }

  useEffect(() => {
    const el = scrollContainerRef.current
    if (el) {
      el.addEventListener("scroll", checkScrollLimits)
      checkScrollLimits()
      window.addEventListener("resize", checkScrollLimits)
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScrollLimits)
      window.removeEventListener("resize", checkScrollLimits)
    }
  }, [categories])

  const scroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current
    if (!el) return
    const scrollAmount = el.clientWidth * 0.7
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  const activeTab = activeCategory || "yeni-gelenler"

  return (
    <div className="relative w-full bg-white pt-8 pb-4 select-none group/carousel border-t border-zinc-100">
      <div className="content-container relative px-4 md:px-8">
        {/* Left Arrow Navigation Overlay */}
        {showLeftArrow && (
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 border border-zinc-200 shadow-md flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-all duration-200 hidden md:flex cursor-pointer"
            aria-label="Sola Kaydır"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right Arrow Navigation Overlay */}
        {showRightArrow && (
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 border border-zinc-200 shadow-md flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-all duration-200 hidden md:flex cursor-pointer"
            aria-label="Sağa Kaydır"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Scrollable Circular Category Tabs Wrapper */}
        <div
          ref={scrollContainerRef}
          className="flex items-center justify-start gap-4 md:gap-5 lg:justify-between overflow-x-auto pb-2 px-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
        >
          {allTabs.map((tab, idx) => {
            const isActive = activeTab === tab.handle

            return (
              <LocalizedClientLink
                key={tab.handle || idx}
                href={tab.handle === "yeni-gelenler" ? "/" : `/?category=${tab.handle}`}
                scroll={false}
                className="flex flex-col items-center gap-2 group/tab min-w-[82px] md:min-w-[90px] shrink-0 snap-center cursor-pointer transition-all duration-300"
              >
                {/* Double Ring Circle Container */}
                <div
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-full border flex items-center justify-center transition-all duration-300 relative bg-white transform group-hover/tab:scale-105 ${
                    isActive
                      ? "border-violet-600 border-2 shadow-[0_4px_16px_rgba(124,58,237,0.12)]"
                      : "border-zinc-200 group-hover/tab:border-violet-400 group-hover/tab:shadow-sm"
                  }`}
                >
                  {/* Outer circle sub-ring */}
                  <div
                    className={`absolute inset-1.5 rounded-full border transition-all duration-300 ${
                      isActive
                        ? "border-violet-600/30 bg-violet-50/5"
                        : "border-zinc-100 group-hover/tab:border-zinc-200/50"
                    }`}
                  />

                  {/* SVG or Image Render */}
                  <div
                    className={`relative z-10 w-9 h-9 flex items-center justify-center shrink-0 transition-colors duration-300 ${
                      isActive ? "text-violet-600" : "text-zinc-500 group-hover/tab:text-violet-500"
                    }`}
                  >
                    {tab.icon && tab.icon.trim().startsWith("<svg") ? (
                      <div
                        className="w-8 h-8 flex items-center justify-center svg-container"
                        dangerouslySetInnerHTML={{ __html: tab.icon }}
                      />
                    ) : (
                      <img
                        src={tab.icon}
                        className="w-8 h-8 object-contain"
                        alt={tab.name}
                      />
                    )}
                  </div>

                  {/* Pulsing indicator dot */}
                  <span
                    className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white transition-all duration-300 ${
                      isActive ? "bg-violet-600 scale-110" : "bg-zinc-200 group-hover/tab:bg-violet-400"
                    }`}
                  />
                </div>

                {/* Tab Label */}
                <span
                  className={`text-[10px] md:text-xs font-bold uppercase tracking-wider text-center transition-colors duration-300 whitespace-nowrap mt-1 ${
                    isActive
                      ? "text-violet-600 font-extrabold"
                      : "text-zinc-500 group-hover/tab:text-zinc-800"
                  }`}
                >
                  {tab.name}
                </span>
              </LocalizedClientLink>
            )
          })}
        </div>
      </div>

      {/* Inline styles for hiding scrollbar */}
      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .svg-container svg {
          width: 32px !important;
          height: 32px !important;
        }
      `}</style>
    </div>
  )
}
