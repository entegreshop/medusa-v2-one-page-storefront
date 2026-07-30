"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0)

  // Swipe logic state
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
        Görsel Bulunmuyor
      </div>
    )
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  // Swipe handlers
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      handleNext()
    }
    if (isRightSwipe) {
      handlePrev()
    }
  }

  return (
    <div className="flex flex-col-reverse medium:flex-row items-start gap-4 h-full">
      {/* Thumbnail List */}
      {images.length > 1 && (
        <div className="flex flex-row medium:flex-col gap-3 overflow-x-auto medium:overflow-y-auto medium:max-h-[850px] no-scrollbar w-full medium:w-[90px] flex-shrink-0">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-[3/4] w-20 medium:w-full overflow-hidden flex-shrink-0 border transition-all ${
                activeIndex === index
                  ? "border-black shadow-sm"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              {image.url && (
                image.url.match(/\.(mp4|webm|mov)$/i) ? (
                  <video
                    src={image.url}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <Image
                    alt={`Thumbnail ${index + 1}`}
                    src={image.url}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                )
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div 
        className="relative aspect-[3/4] w-full flex-grow overflow-hidden bg-gray-50 border border-gray-100 group"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-300 ease-in-out ${
              activeIndex === index ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {image.url && (
              image.url.match(/\.(mp4|webm|mov)$/i) ? (
                <video
                  src={image.url}
                  autoPlay={activeIndex === index}
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <Image
                  alt="Product Image"
                  src={image.url}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 800px"
                />
              )
            )}
          </div>
        ))}

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/70 hover:bg-white text-black transition-colors rounded-full shadow-sm z-20"
              aria-label="Önceki Görsel"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/70 hover:bg-white text-black transition-colors rounded-full shadow-sm z-20"
              aria-label="Sonraki Görsel"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ImageGallery
