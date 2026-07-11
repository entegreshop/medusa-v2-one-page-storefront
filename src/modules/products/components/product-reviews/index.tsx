"use client"

import React, { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"

type Review = {
  id: string
  rating: number
  title?: string
  comment: string
  date: string
  author: string
}

type ProductReviewsProps = {
  product: HttpTypes.StoreProduct
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ product }) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewComment, setReviewComment] = useState("")
  const [reviewAuthor, setReviewAuthor] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`reviews-${product.id}`)
      if (saved) {
        try {
          setReviews(JSON.parse(saved))
        } catch (e) {
          console.error("Failed to parse reviews", e)
        }
      }
    }
  }, [product.id])

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewComment.trim()) return

    const newReview: Review = {
      id: Math.random().toString(36).substring(2, 9),
      rating,
      title: reviewTitle,
      comment: reviewComment,
      author: reviewAuthor.trim() || "Ziyaretçi",
      date: new Date().toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }

    const updatedReviews = [newReview, ...reviews]
    setReviews(updatedReviews)
    if (typeof window !== "undefined") {
      localStorage.setItem(`reviews-${product.id}`, JSON.stringify(updatedReviews))
    }

    // Reset form
    setReviewTitle("")
    setReviewComment("")
    setReviewAuthor("")
    setRating(5)
  }

  return (
    <div id="product-reviews" className="mt-12 border-t pt-8 scroll-mt-24">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-black">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 text-black"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Ürün Değerlendirmeleri
      </h2>

      {/* Write a review form */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-100">
        <h3 className="font-semibold text-lg mb-4 text-black">Değerlendirme Yazın</h3>
        <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
          {/* Star selection */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Puanınız:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= (hoverRating ?? rating)
                return (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="transition-colors duration-150"
                    aria-label={`${star} Yıldız ver`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill={filled ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`w-8 h-8 ${
                        filled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Author */}
          <input
            type="text"
            placeholder="Adınız Soyadınız (Ziyaretçi olarak görünmek için boş bırakın)"
            value={reviewAuthor}
            onChange={(e) => setReviewAuthor(e.target.value)}
            className="border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:border-black text-black"
          />

          {/* Title */}
          <input
            type="text"
            placeholder="Başlık (Opsiyonel)"
            value={reviewTitle}
            onChange={(e) => setReviewTitle(e.target.value)}
            className="border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:border-black text-black"
          />

          {/* Comment */}
          <textarea
            placeholder="Yorumunuzu buraya yazın..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            required
            className="border border-gray-300 bg-white p-3 text-sm h-28 focus:outline-none focus:border-black text-black"
          ></textarea>

          <button
            type="submit"
            className="bg-black text-white px-8 py-3 uppercase tracking-wider text-xs font-bold self-start hover:bg-neutral-800 transition-colors"
          >
            Gönder
          </button>
        </form>
      </div>

      {/* List of reviews */}
      <div className="flex flex-col gap-6">
        {reviews.length === 0 ? (
          <p className="text-gray-500">
            Bu ürün için henüz değerlendirme bulunmuyor. İlk değerlendiren siz olun!
          </p>
        ) : (
          <div className="space-y-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="border-b border-gray-100 pb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-black">{rev.author}</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => {
                        const filled = i < rev.rating
                        return (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill={filled ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`w-3.5 h-3.5 ${
                              filled ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                            }`}
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        )
                      })}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{rev.date}</span>
                </div>
                {rev.title && <h4 className="font-bold text-sm text-black mb-1">{rev.title}</h4>}
                <p className="text-gray-600 text-sm leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductReviews
