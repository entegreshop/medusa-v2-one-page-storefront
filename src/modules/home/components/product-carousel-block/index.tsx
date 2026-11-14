"use client"

import React, { useRef, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export interface CarouselBlockConfig {
  id: string
  title: string
  subtitle?: string
  badge_text?: string
  source_type?: "latest" | "category" | "collection"
  handle?: string
  limit?: number
  position?: "above_banners" | "below_banners" | "below_categories" | "below_products"
  bg_color?: string
  text_color?: string
  accent_color?: string
  btn_text?: string
  btn_link?: string
  autoplay?: boolean
  active?: boolean
}

export default function ProductCarouselBlock({
  block,
  products,
  region,
}: {
  block: CarouselBlockConfig
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollByAmount = (dir: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.clientWidth > 768 ? el.clientWidth * 0.5 : el.clientWidth * 0.8
    el.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    if (!block.autoplay || !products || products.length <= 4) return
    const timer = window.setInterval(() => {
      const el = scrollRef.current
      if (!el) return
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 20) {
        el.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        el.scrollBy({ left: 300, behavior: "smooth" })
      }
    }, 4500)
    return () => window.clearInterval(timer)
  }, [block.autoplay, products])

  if (!products || products.length === 0) return null

  const accent = block.accent_color || "#7C3AED"
  const bgColor = block.bg_color || "#ffffff"
  const textColor = block.text_color || "#111827"

  return (
    <section
      className="w-full py-10 md:py-14 border-b border-zinc-100"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="content-container">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            {block.badge_text && (
              <span
                className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-2.5"
                style={{
                  backgroundColor: `${accent}18`,
                  color: accent,
                }}
              >
                {block.badge_text}
              </span>
            )}
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: textColor }}>
              {block.title}
            </h2>
            {block.subtitle && (
              <p className="text-sm text-zinc-500 mt-1 max-w-2xl">{block.subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {block.btn_text && (
              <LocalizedClientLink
                href={block.btn_link || "/store"}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors hover:opacity-90"
                style={{
                  borderColor: accent,
                  color: accent,
                }}
              >
                {block.btn_text} →
              </LocalizedClientLink>
            )}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollByAmount("left")}
                aria-label="Önceki Ürünler"
                className="w-9 h-9 rounded-full border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-100 flex items-center justify-center shadow-2xs transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount("right")}
                aria-label="Sonraki Ürünler"
                className="w-9 h-9 rounded-full border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-100 flex items-center justify-center shadow-2xs transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scroll-Snap Product Track */}
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar"
          style={{ scrollbarWidth: "none" }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="snap-start shrink-0 w-[210px] sm:w-[250px] md:w-[280px]"
            >
              <ProductPreview product={product} region={region} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
