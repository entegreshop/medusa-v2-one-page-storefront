"use client"

import React, { useState, useEffect, useRef } from "react"
import { medusa } from "@/lib/medusa"
import {
  trackViewContent,
  trackAddToCart,
  trackInitiateCheckout,
  trackAddPaymentInfo,
  trackPurchase
} from "@/lib/tracking"
import { TURKEY_ADDRESS_DATA } from "@/lib/turkey-address-data"

const isVideoUrl = (url: string) => {
  if (!url) return false
  return /\.(mp4|webm|mov|ogg|avi)($|\?)/i.test(url) || url.includes("/video")
}

interface ProductOptionValue {
  id: string
  value: string
}

interface ProductOption {
  id: string
  title: string
  values: ProductOptionValue[]
}

interface ProductVariant {
  id: string
  title: string
  sku: string
  options?: { option_id: string; value: string }[]
  prices?: { amount: string | number; currency_code: string }[]
  calculated_price?: { calculated_amount: number; currency_code: string }
  thumbnail?: string
}

interface Product {
  id: string
  title: string
  handle: string
  description?: string
  thumbnail?: string
  images?: { url: string }[]
  options?: ProductOption[]
  variants?: ProductVariant[]
  metadata?: Record<string, any>
}

interface ProductLandingPageProps {
  product: Product
}

const REVIEWS = [
  {
    id: 1,
    name: "Mehmet A.",
    rating: 5,
    score: "5.0 / 5",
    comment: "Kumaş kalitesi harika, tam yazlık. Oversize duruşu çok rahat. Kesinlikle tavsiye ederim!",
    image: "/uploads/1781185588741.jpg"
  },
  {
    id: 2,
    name: "Seda K.",
    rating: 5,
    score: "5.0 / 5",
    comment: "Rengi, kumaşı, kalıbı muazzam. Yıkayınca çekme yapmadı. Eşimle kombin yapıyoruz :)",
    image: "/uploads/1781185588757.jpg"
  },
  {
    id: 3,
    name: "Emre Y.",
    rating: 5,
    score: "5.0 / 5",
    comment: "Gerçekten oversize sevenler için biçilmiş kaftan. Rahat ve şık, her yere uygun!",
    image: "/uploads/1781185588785.jpg"
  }
]

export default function ProductLandingPage({ product }: ProductLandingPageProps) {
  // Options
  const colorOption = product.options?.find(
    (o) => o.title.toLowerCase() === "color" || o.title.toLowerCase() === "renk"
  )
  const sizeOption = product.options?.find(
    (o) => o.title.toLowerCase() === "size" || o.title.toLowerCase() === "beden"
  )

  const colors = colorOption?.values?.map((v) => v.value) || []
  const sizes = sizeOption?.values?.map((v) => v.value) || []

  const defaultColor = colors[0] || ""
  const defaultSize = sizes[0] || ""

  // Component States
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null) // starts empty
  const [selectedItems, setSelectedItems] = useState<{ color: string; size: string }[]>([])
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false)

  // Tracking flags to ensure events trigger exactly once per action
  const trackedViewContentRef = useRef<Record<number, boolean>>({})
  const trackedAddToCartRef = useRef<Record<string, boolean>>({})
  const trackedInitiateCheckoutRef = useRef<boolean>(false)
  const trackedAddPaymentInfoRef = useRef<Record<string, boolean>>({})

  const handleSelectPackage = (pkgId: number) => {
    setSelectedPackage(pkgId)
    setTimeout(() => {
      optionsRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleSelectColor = (index: number, color: string) => {
    setSelectedItems((prev) => {
      const wasIncomplete = !prev[index] || !prev[index].color || !prev[index].size
      const newItems = [...prev]
      newItems[index] = { ...newItems[index], color }

      const allSelected = newItems.length > 0 && newItems.every(item => item.color && item.size)

      if (wasIncomplete && newItems[index].color && newItems[index].size) {
        if (allSelected) {
          setTimeout(() => {
            shippingFormRef.current?.scrollIntoView({ behavior: "smooth" })
          }, 150)
        } else {
          setTimeout(() => {
            const nextItemEl = document.getElementById(`product-selection-item-${index + 1}`)
            if (nextItemEl) {
              nextItemEl.scrollIntoView({ behavior: "smooth", block: "center" })
            }
          }, 150)
        }
      }

      return newItems
    })
  }

  const handleSelectSize = (index: number, size: string) => {
    setSelectedItems((prev) => {
      const wasIncomplete = !prev[index] || !prev[index].color || !prev[index].size
      const newItems = [...prev]
      newItems[index] = { ...newItems[index], size }

      const allSelected = newItems.length > 0 && newItems.every(item => item.color && item.size)

      if (wasIncomplete && newItems[index].color && newItems[index].size) {
        if (allSelected) {
          setTimeout(() => {
            shippingFormRef.current?.scrollIntoView({ behavior: "smooth" })
          }, 150)
        } else {
          setTimeout(() => {
            const nextItemEl = document.getElementById(`product-selection-item-${index + 1}`)
            if (nextItemEl) {
              nextItemEl.scrollIntoView({ behavior: "smooth", block: "center" })
            }
          }, 150)
        }
      }

      return newItems
    })
  }

  useEffect(() => {
    if (selectedPackage === null) {
      setSelectedItems([])
      return
    }
    setSelectedItems((prev) => {
      const newItems = [...prev]
      if (newItems.length < selectedPackage) {
        while (newItems.length < selectedPackage) {
          newItems.push({
            color: "",
            size: "",
          })
        }
      } else if (newItems.length > selectedPackage) {
        newItems.splice(selectedPackage)
      }
      return newItems
    })
  }, [selectedPackage])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [orderId, setOrderId] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")

  // Vertical Swipe Banner States
  const [activeSlide, setActiveSlide] = useState<number>(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const handleCarouselScroll = () => {
    if (carouselRef.current) {
      const { scrollTop, clientHeight } = carouselRef.current
      if (clientHeight > 0) {
        const index = Math.round(scrollTop / clientHeight)
        setActiveSlide(index)
      }
    }
  }

  // Reviews Carousel States
  const [activeReviewSlide, setActiveReviewSlide] = useState<number>(0)
  const reviewsCarouselRef = useRef<HTMLDivElement>(null)

  const handleReviewsScroll = () => {
    if (reviewsCarouselRef.current) {
      const { scrollLeft } = reviewsCarouselRef.current
      const children = Array.from(reviewsCarouselRef.current.children) as HTMLElement[]
      let closestIndex = 0
      let minDiff = Infinity
      children.forEach((child, index) => {
        const diff = Math.abs(child.offsetLeft - 16 - scrollLeft)
        if (diff < minDiff) {
          minDiff = diff
          closestIndex = index
        }
      })
      if (closestIndex < children.length) {
        setActiveReviewSlide(closestIndex)
      }
    }
  }

  // Storefront review submission states
  const [showStorefrontReviewModal, setShowStorefrontReviewModal] = useState<boolean>(false)
  const [storefrontReviewName, setStorefrontReviewName] = useState<string>("")
  const [storefrontReviewColor, setStorefrontReviewColor] = useState<string>(colors[0] || "Standart")
  const [storefrontReviewRating, setStorefrontReviewRating] = useState<number>(5)
  const [storefrontReviewComment, setStorefrontReviewComment] = useState<string>("")
  const [storefrontReviewMediaUrl, setStorefrontReviewMediaUrl] = useState<string>("")
  const [storefrontReviewMediaType, setStorefrontReviewMediaType] = useState<"image" | "video">("image")
  const [storefrontReviewUploading, setStorefrontReviewUploading] = useState<boolean>(false)
  const [storefrontReviewSuccess, setStorefrontReviewSuccess] = useState<boolean>(false)

  const handleStorefrontReviewMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    setStorefrontReviewUploading(true)
    const reader = new FileReader()

    reader.onload = async () => {
      try {
        const base64 = reader.result as string
        const res = await fetch("/store/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            filetype: file.type,
            base64
          })
        })
        const data = await res.json()
        if (data && data.success) {
          setStorefrontReviewMediaUrl(data.url)
          if (isVideoUrl(data.url)) {
            setStorefrontReviewMediaType("video")
          } else {
            setStorefrontReviewMediaType("image")
          }
        } else {
          alert("Medya yüklenirken hata oluştu: " + (data.message || "Yükleme başarısız"))
        }
      } catch (err: any) {
        alert("Medya yüklenirken hata oluştu: " + err.message)
      } finally {
        setStorefrontReviewUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleStorefrontReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storefrontReviewName.trim()) return alert("Lütfen adınızı girin.")
    if (!storefrontReviewComment.trim()) return alert("Lütfen yorumunuzu girin.")

    setStorefrontReviewUploading(true)
    try {
      const res = await fetch(`/store/products/${product.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: storefrontReviewName,
          color: storefrontReviewColor,
          rating: storefrontReviewRating,
          comment: storefrontReviewComment,
          image: storefrontReviewMediaUrl,
          media_type: storefrontReviewMediaType
        })
      })
      const data = await res.json()
      if (data && data.success) {
        setStorefrontReviewSuccess(true)
        setStorefrontReviewName("")
        setStorefrontReviewColor(colors[0] || "Standart")
        setStorefrontReviewRating(5)
        setStorefrontReviewComment("")
        setStorefrontReviewMediaUrl("")
        setStorefrontReviewMediaType("image")
        setTimeout(() => {
          setStorefrontReviewSuccess(false)
          setShowStorefrontReviewModal(false)
        }, 3000)
      } else {
        alert("Değerlendirme kaydedilirken hata oluştu: " + (data.message || "Bilinmeyen hata"))
      }
    } catch (err: any) {
      alert("Değerlendirme gönderilirken hata oluştu: " + err.message)
    } finally {
      setStorefrontReviewUploading(false)
    }
  }

  // Form States
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    city: "",
    district: "",
    address: "",
    paymentMethod: "",
  })

  // Custom Validation Popup States
  const [showValidationPopup, setShowValidationPopup] = useState<boolean>(false)
  const [validationPopupMessage, setValidationPopupMessage] = useState<string>("")

  const triggerValidationPopup = (msg: string) => {
    setValidationPopupMessage(msg)
    setShowValidationPopup(true)
  }

  // Dismiss popup timer
  useEffect(() => {
    if (showValidationPopup) {
      const timer = setTimeout(() => {
        setShowValidationPopup(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showValidationPopup])

  // Timer State
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 47,
    seconds: 35,
  })

  const formRef = useRef<HTMLDivElement>(null)
  const shippingFormRef = useRef<HTMLDivElement>(null)
  const optionsRef = useRef<HTMLDivElement>(null)

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else {
          return { hours: 2, minutes: 0, seconds: 0 }
        }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Scroll to top handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const getBasePrice = () => {
    const variant = product.variants?.[0]
    if (!variant) return 599 // Match reference top price (599 TL)

    if (variant.calculated_price) {
      return variant.calculated_price.calculated_amount
    }
    if (variant.prices && variant.prices.length > 0) {
      const trPrice = variant.prices.find((p) => p.currency_code === "try")
      if (trPrice) return parseFloat(trPrice.amount.toString())
      return parseFloat(variant.prices[0].amount.toString())
    }
    return 599
  }

  const basePrice = getBasePrice()
  const displayCurrency = "TL"

  // Package prices matching screenshot: 599, 999, 1399, 1799
  const getPriceForPackage = (pkg: number | null) => {
    if (pkg === null) return 0
    
    // 1. Try new array structure
    const metaPrices = product.metadata?.package_prices
    if (Array.isArray(metaPrices) && metaPrices.length >= pkg) {
      const priceVal = metaPrices[pkg - 1]
      const parsed = parseFloat(priceVal?.toString())
      if (!isNaN(parsed)) return parsed
    }

    // 2. Try old individual fields structure
    const metaPrice = product.metadata?.[`package_price_${pkg}`]
    if (metaPrice) {
      const parsed = parseFloat(metaPrice.toString())
      if (!isNaN(parsed)) return parsed
    }
    
    switch (pkg) {
      case 1:
        return basePrice
      case 2:
        return Math.round(basePrice * 2 - 199) // 599 * 2 - 199 = 999 TL
      case 3:
        return Math.round(basePrice * 3 - 398) // 599 * 3 - 398 = 1399 TL
      case 4:
        return Math.round(basePrice * 4 - 597) // 599 * 4 - 597 = 1799 TL
      default:
        return basePrice
    }
  }

  const getPackagesList = () => {
    const defaultPackages = [
      { id: 1, name: "1 Adet", label: "Oversize Unisex Takım", badge: "Ücretsiz Kargo" },
      { id: 2, name: "2 Adet", label: "Oversize Unisex Takım", badge: "En Çok Satan" },
      { id: 3, name: "3 Adet", label: "Oversize Unisex Takım", badge: "En Avantajlı" },
      { id: 4, name: "4 Adet", label: "Oversize Unisex Takım", badge: "Kargo Bedava" },
    ]

    const metaPrices = product.metadata?.package_prices
    if (Array.isArray(metaPrices) && metaPrices.length > 0) {
      return metaPrices.map((_, idx) => {
        const id = idx + 1
        return {
          id,
          name: `${id} Adet`,
          label: "Oversize Unisex Takım",
          badge: id === 1 ? "Ücretsiz Kargo" : id === 2 ? "En Çok Satan" : id === 3 ? "En Avantajlı" : id === 4 ? "Kargo Bedava" : "Süper Fırsat"
        }
      })
    }

    // Fallback to checking individual fields
    const individualPrices: number[] = []
    for (let i = 1; i <= 10; i++) {
      if (product.metadata?.[`package_price_${i}`]) {
        individualPrices.push(i)
      }
    }
    if (individualPrices.length > 0) {
      const maxPkg = Math.max(...individualPrices)
      return Array.from({ length: maxPkg }).map((_, idx) => {
        const id = idx + 1
        return {
          id,
          name: `${id} Adet`,
          label: "Oversize Unisex Takım",
          badge: id === 1 ? "Ücretsiz Kargo" : id === 2 ? "En Çok Satan" : id === 3 ? "En Avantajlı" : id === 4 ? "Kargo Bedava" : "Süper Fırsat"
        }
      })
    }

    return defaultPackages
  }

  const getOriginalPriceForPackage = (pkg: number | null) => {
    if (pkg === null) return 0
    return basePrice * pkg
  }

  const currentPrice = getPriceForPackage(selectedPackage)
  const originalPrice = getOriginalPriceForPackage(selectedPackage)
  const totalSavings = originalPrice - currentPrice

  const findMatchingVariantForItem = (color: string, size: string) => {
    if (!product.variants || product.variants.length === 0) return null

    return product.variants.find((variant) => {
      let isMatch = true
      if (variant.options && variant.options.length > 0) {
        variant.options.forEach((vo) => {
          const parentOption = product.options?.find((o) => o.id === vo.option_id)
          if (!parentOption) return
          const title = parentOption.title.toLowerCase()
          if (title === "color" || title === "renk") {
            if (vo.value.toLowerCase() !== color.toLowerCase()) isMatch = false
          }
          if (title === "size" || title === "beden") {
            if (vo.value.toLowerCase() !== size.toLowerCase()) isMatch = false
          }
        })
      } else {
        const titleLower = variant.title.toLowerCase()
        if (color && !titleLower.includes(color.toLowerCase())) isMatch = false
        if (size && !titleLower.includes(size.toLowerCase())) isMatch = false
      }
      return isMatch
    }) || product.variants[0]
  }

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (selectedPackage === null) {
      triggerValidationPopup("Lütfen önce bir paket adedi seçin.")
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    const isOptionsComplete = selectedItems.length > 0 && selectedItems.every(item => item.color && item.size)
    if (!isOptionsComplete) {
      triggerValidationPopup("Lütfen renk ve beden seçiminizi yapın.")
      setTimeout(() => {
        optionsRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
      return
    }

    if (!formData.fullName || !formData.phone || !formData.city || !formData.district || !formData.address) {
      setErrorMessage("Lütfen tüm formu eksiksiz doldurun.")
      return
    }

    if (!formData.paymentMethod) {
      setErrorMessage("Lütfen ödeme türünü seçin.")
      return
    }

    // Fire tracking events once exactly when form is successfully submitted
    if (!trackedInitiateCheckoutRef.current) {
      trackedInitiateCheckoutRef.current = true
      selectedItems.forEach(item => {
        trackAddToCart({
          id: product.id + "-" + item.color + "-" + item.size,
          title: `${product.title} (${item.color} / ${item.size})`,
          price: currentPrice / (selectedPackage || 1),
          currency: displayCurrency,
          quantity: 1
        })
      })
      trackInitiateCheckout({
        id: "temp_cart",
        total: currentPrice,
        currency: displayCurrency,
        items: selectedItems.map((item) => ({
          id: product.id + "-" + item.color + "-" + item.size,
          title: `${product.title} (${item.color} / ${item.size})`,
          quantity: 1,
          unit_price: (currentPrice / (selectedPackage || 1)) * 100
        }))
      })
    }

    const variantQuantities: Record<string, number> = {}
    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i]
      const matchingVariant = findMatchingVariantForItem(item.color, item.size)
      if (!matchingVariant) {
        setErrorMessage(`${i + 1}. ürün için seçilen varyasyon bulunamadı.`)
        return
      }
      variantQuantities[matchingVariant.id] = (variantQuantities[matchingVariant.id] || 0) + 1
    }

    setIsLoading(true)

    try {
      const regionsRes = await medusa.store.region.list()
      const tryRegion = regionsRes.regions?.find(
        (r: any) => r.currency_code === "try" || r.name?.toLowerCase() === "turkey"
      )
      
      if (!tryRegion) {
        setErrorMessage("Sistemde Türkiye (TRY) bölgesi bulunamadı. Lütfen Medusa Admin panelinden Region (Bölge) oluşturun ve Sales Channel'a ekleyin.")
        setIsLoading(false)
        return
      }
      
      const regionId = tryRegion.id

      const cartResponse = await medusa.store.cart.create({
        region_id: regionId,
        metadata: {
          package_selection: `${selectedPackage} Adet Kampanyası`,
          payment_method: formData.paymentMethod === "cash" ? "Kapıda Nakit" : "Kapıda Kredi Kartı",
          full_name: formData.fullName,
          original_price: `${originalPrice} TL`,
          final_price: `${currentPrice} TL`,
          savings: `${totalSavings} TL`,
          selections: selectedItems.map((item, idx) => `${idx + 1}. ${item.color} - ${item.size}`).join(", "),
        },
      })

      const cart = cartResponse.cart
      if (!cart) throw new Error("Sepet oluşturulamadı.")

      for (const [variantId, qty] of Object.entries(variantQuantities)) {
        await medusa.store.cart.createLineItem(cart.id, {
          variant_id: variantId,
          quantity: qty,
        })
      }

      const nameParts = formData.fullName.trim().split(" ")
      const firstName = nameParts[0] || "Müşteri"
      const lastName = nameParts.slice(1).join(" ") || "Soyadı"
      
      let finalPhone = formData.phone.trim().replace(/^(\+90|90|0)/, "")
      finalPhone = `+90${finalPhone.replace(/\D/g, "")}`
      
      const mockEmail = `${finalPhone.replace(/\D/g, "")}@kapidaodeme.com`

      const updateResponse = await medusa.store.cart.update(cart.id, {
        email: mockEmail,
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          phone: finalPhone,
          address_1: formData.address,
          city: formData.city,
          province: formData.district,
          country_code: "tr",
        },
        billing_address: {
          first_name: firstName,
          last_name: lastName,
          phone: finalPhone,
          address_1: formData.address,
          city: formData.city,
          province: formData.district,
          country_code: "tr",
        },
      })

      const updatedCart = updateResponse.cart

      const shippingOptionsRes = await medusa.store.fulfillment.listCartOptions({ cart_id: cart.id })
      const shippingOption = shippingOptionsRes.shipping_options?.[0]
      
      if (shippingOption) {
        await medusa.store.cart.addShippingMethod(cart.id, {
          option_id: shippingOption.id,
        })
      }

      await medusa.store.payment.initiatePaymentSession(updatedCart, {
        provider_id: "pp_system_default",
      })

      const completionRes = await medusa.store.cart.complete(cart.id)
      
      if (completionRes.order) {
        setOrderId(completionRes.order.id)
        
        // Save the payment method to the order metadata
        try {
          await fetch(`${backendUrl}/store/update-order-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_id: completionRes.order.id,
              payment_method: formData.paymentMethod === "cash" ? "Kapıda Nakit" : "Kapıda Kredi Kartı"
            })
          })
        } catch (e) {
          console.error("Failed to save payment method to order metadata", e)
        }

        setIsSuccess(true)

        // Trigger Purchase
        trackPurchase({
          id: completionRes.order.id,
          total: completionRes.order.total || currentPrice,
          currency: completionRes.order.currency_code || displayCurrency,
          items: completionRes.order.items || selectedItems.map((item, idx) => ({
            id: product.id + "-" + item.color + "-" + item.size,
            title: `${product.title} (${item.color} / ${item.size})`,
            quantity: 1,
            unit_price: (currentPrice / (selectedPackage || 1)) * 100
          }))
        })
      } else {
        throw new Error("Sipariş tamamlanamadı.")
      }
    } catch (error: any) {
      console.error("Order submission error:", error)
      setErrorMessage(error.message || "Sipariş verilirken teknik bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  // Extract variant images (thumbnails) from variants list
  const variantThumbnails = product.variants
    ?.map((v: any) => v.metadata?.image || v.thumbnail)
    .filter((t): t is string => !!t) || []

  const variantBaseNames = variantThumbnails.map(url => {
    const filename = url.split('/').pop() || "";
    return filename.replace(/^\d+-/, "");
  })

  // Get product images from gallery (the designed vertical banners), filtering out variant images
  const rawProductImages = product.images && product.images.length > 0
    ? product.images.map((img) => img.url)
    : [product.thumbnail || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"]

  const metadataCarousel = (product as any).metadata?.carousel_images as string[] | undefined
  const hasMetadataCarousel = metadataCarousel && Array.isArray(metadataCarousel) && metadataCarousel.some(url => !!url)

  // Load reviews from metadata or fallback to static REVIEWS
  const metadataReviews = (product as any).metadata?.reviews as any[] | undefined
  const hasMetadataReviews = metadataReviews && Array.isArray(metadataReviews) && metadataReviews.length > 0
  const activeReviews = hasMetadataReviews
    ? metadataReviews.filter((rev: any) => rev && rev.is_active !== false)
    : REVIEWS

  const totalReviewsCount = activeReviews.length
  const averageRating = totalReviewsCount > 0
    ? (activeReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / totalReviewsCount).toFixed(1)
    : "5.0"

  const productImages = hasMetadataCarousel
    ? metadataCarousel.filter(url => !!url)
    : rawProductImages.filter(url => {
        const filename = url.split('/').pop() || "";
        const baseName = filename.replace(/^\d+-/, "");
        return !variantBaseNames.includes(baseName);
      })

  const hasVariantThumbnails = variantThumbnails.length > 0

  // Skip the first image (plain t-shirt mockup) in the main flow if multiple images exist and it's not metadata-driven.
  // Otherwise, use all metadata carousel banners directly.
  const activeBanners = hasMetadataCarousel
    ? productImages
    : (productImages.length > 1 ? productImages.slice(1, 4) : productImages)
  
  // Any images beyond the 4th (5th, 6th, etc.) will be shown as detail banners at the bottom.
  const displayDetailBanners = productImages.length > 4 ? productImages.slice(4) : []

  // Determine the variant preview row images (only show if variant thumbnails exist)
  const displayVariantImages = hasVariantThumbnails ? variantThumbnails : []

  // Helper function to get image for a variant color option
  const getVariantColorImage = (colorName: string, index: number) => {
    // 1. Try variant thumbnail
    const matchingVariant = product.variants?.find((v) => {
      if (v.options) {
        return v.options.some((vo) => {
          const parentOption = product.options?.find((o) => o.id === vo.option_id)
          const title = parentOption?.title.toLowerCase()
          return (title === "color" || title === "renk") && vo.value.toLowerCase() === colorName.toLowerCase()
        })
      }
      return v.title.toLowerCase().includes(colorName.toLowerCase())
    })
    const variantImg = (matchingVariant as any)?.metadata?.image || matchingVariant?.thumbnail
    if (variantImg) return variantImg

    // 2. Try variantThumbnails array index
    if (variantThumbnails[index]) return variantThumbnails[index]

    // 3. Fallback to product thumbnail or the 1st catalog image (plain t-shirt mockup)
    return product.thumbnail || productImages[0]
  }

  // Fallback variant image for package list thumbnails
  const packageThumbnail = variantThumbnails[0] || product.thumbnail || productImages[0]

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-900 pb-24 font-sans flex justify-center">
      {/* Centered Desktop Layout Container (max-w-2xl) */}
      <div className="w-full max-w-2xl bg-white shadow-2xl min-h-screen flex flex-col">
        
        {isSuccess ? (
          /* SUCCESS SCREEN */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-emerald-50/20">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-emerald-800">TEBRİKLER!</h2>
            <p className="text-lg font-bold text-gray-700 mt-2">Siparişiniz Başarıyla Alındı</p>
            <p className="text-sm text-gray-500 mt-4 px-4 leading-relaxed">
              Müşteri temsilcilerimiz sipariş onayı ve teslimat detayları için en kısa sürede sizinle iletişime geçecektir.
            </p>

            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 w-full mt-8 text-left space-y-3.5">
              <div className="flex justify-between border-b border-gray-100 pb-2.5 text-sm">
                <span className="text-gray-400 font-medium">Sipariş No:</span>
                <span className="font-mono font-bold text-gray-800">{orderId.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2.5 text-sm">
                <span className="text-gray-400 font-medium">Alıcı Adı:</span>
                <span className="font-semibold text-gray-800">{formData.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2.5 text-sm">
                <span className="text-gray-400 font-medium">Telefon:</span>
                <span className="font-semibold text-gray-800">{formData.phone}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2.5 text-sm">
                <span className="text-gray-400 font-medium">Paket:</span>
                <span className="font-bold text-indigo-600">{selectedPackage} Adet Kampanyası</span>
              </div>
              <div className="flex justify-between text-base pt-2">
                <span className="text-gray-800 font-black">Toplam Tutar:</span>
                <span className="font-black text-emerald-600 text-xl">{currentPrice} {displayCurrency}</span>
              </div>
            </div>

            <button
              onClick={() => setIsSuccess(false)}
              className="mt-10 bg-gray-900 text-white w-full py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg"
            >
              Yeni Sipariş Oluştur
            </button>
          </div>
        ) : (
          /* LANDING PAGE BODY */
          <div className="flex flex-col">
            
            {/* 1. Seamless Stacked Banners */}
            <div className="w-full flex flex-col border-0 p-0 m-0 gap-0 bg-white">
              {activeBanners
                .filter((url) => !url.toLowerCase().includes("page-3"))
                .map((url, idx) => (
                  <img
                    key={url}
                    src={url}
                    alt={`${product.title} - Banner ${idx + 1}`}
                    className="w-full h-auto block border-0 p-0 m-0"
                    style={{ display: "block", marginBottom: "-1px" }}
                  />
                ))}
            </div>

            {/* 1.5. Coded Reviews Carousel (Sizden Gelenler) */}
            <div className="py-8 bg-zinc-50 border-t border-b border-zinc-100 flex flex-col items-center">
              <div className="text-center px-4 mb-4">
                <h2 className="text-2xl font-black text-zinc-900 tracking-wider uppercase">
                  SİZDEN GELENLER
                </h2>
                <p className="font-caveat text-2xl text-[#9c4d6b] mt-1 font-bold">
                  Memnuniyetiniz Bize Güç Veriyor!
                </p>
              </div>

              {/* Storefront Rating Summary & Review Action */}
              <div className="flex flex-col items-center mb-6 px-4 text-center">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-500 text-xl tracking-tighter">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < Math.round(Number(averageRating)) ? "★" : "☆"}</span>
                    ))}
                  </div>
                  <span className="text-sm font-black text-zinc-800">
                    {averageRating} / 5
                  </span>
                </div>
                <span className="text-[10px] font-bold text-zinc-400 mt-1">
                  Toplam {totalReviewsCount} gerçek müşteri değerlendirmesi
                </span>
                
                <button
                  type="button"
                  onClick={() => setShowStorefrontReviewModal(true)}
                  className="mt-3.5 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[11px] font-black px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition transform active:scale-97 cursor-pointer uppercase tracking-wider"
                >
                  DEĞERLENDİRME YAP (Yorum & Puan Ekle)
                </button>
              </div>

              {/* Swiper Carousel Container */}
              <div 
                ref={reviewsCarouselRef}
                onScroll={handleReviewsScroll}
                className="w-full overflow-x-auto flex snap-x snap-mandatory hide-scrollbar gap-4 px-4 pb-6 scroll-smooth"
              >
                {activeReviews.map((rev) => {
                  const ratingVal = Number(rev.rating) || 5
                  const scoreVal = rev.score || `${ratingVal.toFixed(1)} / 5`
                  return (
                    <div
                      key={rev.id}
                      className="snap-center shrink-0 w-[290px] bg-white rounded-2xl p-5 border border-zinc-100 shadow-md flex flex-col justify-between"
                    >
                      <div>
                        {/* Rating Header (No Profile Avatar) */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex text-[#9c4d6b] text-base tracking-tighter">
                            {Array.from({ length: ratingVal }).map((_, i) => (
                              <span key={i}>★</span>
                            ))}
                          </div>
                          <span className="text-[11px] font-black text-[#9c4d6b] bg-[#9c4d6b]/5 px-2 py-0.5 rounded-full">
                            {scoreVal}
                          </span>
                        </div>

                        {/* Comment & Name */}
                        <h4 className="font-black text-sm text-zinc-800 mb-1.5">
                          {rev.name}
                          {rev.color && rev.color !== "Standart" && (
                            <span className="text-[9px] text-zinc-400 font-semibold block uppercase">
                              Seçilen Renk: {rev.color}
                            </span>
                          )}
                        </h4>
                        <p className="text-zinc-500 text-xs leading-relaxed font-semibold">
                          {rev.comment}
                        </p>
                      </div>

                      {/* Product wear image / video */}
                      {rev.image && (
                        rev.media_type === "video" || isVideoUrl(rev.image) ? (
                          <video
                            src={rev.image}
                            className="w-full aspect-[4/3] object-cover rounded-xl mt-4 bg-zinc-50 border border-zinc-100/50"
                            autoPlay
                            loop
                            muted
                            playsInline
                            controls
                          />
                        ) : (
                          <img
                            src={rev.image}
                            alt={rev.name}
                            className="w-full aspect-[4/3] object-cover rounded-xl mt-4 bg-zinc-50 border border-zinc-100/50"
                          />
                        )
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Active Slide Indicators (Dots) */}
              <div className="flex justify-center gap-1.5 mt-2">
                {activeReviews.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (reviewsCarouselRef.current) {
                        const cardElement = reviewsCarouselRef.current.children[idx] as HTMLElement;
                        if (cardElement) {
                          reviewsCarouselRef.current.scrollTo({
                            left: cardElement.offsetLeft - 16,
                            behavior: "smooth"
                          });
                        }
                      }
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeReviewSlide === idx ? "w-6 bg-[#9c4d6b]" : "w-2 bg-zinc-200"
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>





            {/* Form & Purchase Flow Container */}
            <div ref={formRef} className="bg-slate-100 p-4 border-t border-gray-200 space-y-6">
              
              {/* Product Header Card with Star Ratings */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex justify-between items-start gap-4">
                <div className="min-w-0 flex-1">
                  <h1 className="text-base font-black text-gray-900 uppercase leading-tight tracking-wide truncate">
                    {product.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex text-amber-500 text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{i < Math.round(Number(averageRating)) ? "★" : "☆"}</span>
                      ))}
                    </div>
                    <span className="text-[10px] font-extrabold text-gray-500">
                      {averageRating} / 5 ({totalReviewsCount} Değerlendirme)
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[9px] text-gray-400 font-bold block uppercase leading-none">Kampanya Fiyatı</span>
                  <span className="text-base font-black text-emerald-600 leading-none block mt-1.5">{getPriceForPackage(1)} TL</span>
                </div>
              </div>

              {/* SECTION: KAÇ ADET İSTİYORSUNUZ? */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <div className="border-b border-gray-100 pb-3 mb-4">
                  <h2 className="text-base font-black text-gray-900 uppercase text-center tracking-wide">
                    🎁 KAÇ ADET İSTİYORSUNUZ?
                  </h2>
                  <p className="text-gray-400 text-[11px] text-center mt-0.5">
                    Paket adedini seç, teslimat bilgilerini doldur. Siparişin hızlıca hazırlanıp kargoya alınır.
                  </p>
                </div>
                
                {/* Stacks vertically (1 column) */}
                <div className="flex flex-col gap-3">
                  {getPackagesList().map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => handleSelectPackage(pkg.id)}
                      className={`relative p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center gap-3.5 bg-white ${
                        selectedPackage === pkg.id
                          ? "border-orange-500 ring-1 ring-orange-500"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {/* Checkbox (Radio style) */}
                      <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedPackage === pkg.id ? "border-orange-500 bg-orange-500" : "border-gray-300"
                      }`}>
                        {selectedPackage === pkg.id && <span className="w-2 h-2 rounded-full bg-white"></span>}
                      </div>

                      {/* Variant Thumbnail (Enlarged to w-16 h-20) */}
                      <img
                        src={packageThumbnail}
                        alt="Product mini"
                        className="w-16 h-20 object-cover rounded-lg shadow-sm shrink-0 bg-gray-50"
                      />

                      {/* Package Details */}
                      <div className="min-w-0 flex-1">
                        <div className="font-black text-gray-800 text-sm leading-tight">{pkg.name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{pkg.label}</div>
                        <div className="flex items-center flex-wrap gap-2 mt-2">
                          <span className="font-black text-emerald-600 text-base leading-none">
                            {getPriceForPackage(pkg.id)} {displayCurrency}
                          </span>
                          {((getPriceForPackage(1) * pkg.id) - getPriceForPackage(pkg.id)) > 0 && (
                            <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-black px-2 py-0.5 rounded-md leading-none">
                              Kazanç: {((getPriceForPackage(1) * pkg.id) - getPriceForPackage(pkg.id))} {displayCurrency}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mini top badge */}
                      {pkg.badge && (
                        <span className="absolute -top-2.5 right-2.5 bg-yellow-400 text-zinc-950 text-[10px] font-black px-2.5 py-1 rounded-md uppercase leading-none shadow-md border border-yellow-500/20 tracking-wider">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: BEDEN VE RENK SEÇİMİ */}
              <div ref={optionsRef} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <div className="border-b border-gray-100 pb-3 mb-4">
                  <h2 className="text-base font-black text-gray-900 uppercase text-center tracking-wide">
                    🎨 BEDEN VE RENK SEÇİMİ
                  </h2>
                  <p className="text-gray-400 text-[11px] text-center mt-0.5">
                    Renk ve beden seçimlerin siparişe işlenir.
                  </p>
                </div>

                <div className="space-y-6">
                  {selectedItems.map((item, index) => (
                    <div key={index} id={`product-selection-item-${index}`} className={index > 0 ? "border-t border-gray-100 pt-5 space-y-4" : "space-y-4"}>
                      {(selectedPackage ?? 0) > 1 && (
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-[#9c4d6b] bg-[#9c4d6b]/5 px-2.5 py-1 rounded-md uppercase tracking-wider">
                            {index + 1}. ÜRÜN SEÇİMİ
                          </span>
                        </div>
                      )}
                      
                      {/* Visual Color Grid (Matching Screenshot) */}
                      {colors.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                            {(selectedPackage ?? 0) > 1 ? `${index + 1}. Ürün Rengi:` : "Renk Seçiniz:"}
                          </h3>
                          <div className="grid grid-cols-3 gap-3">
                            {colors.map((color, colorIdx) => {
                              const imgUrl = getVariantColorImage(color, colorIdx)
                              const isSelected = item.color === color
                              return (
                                <div
                                  key={color}
                                  onClick={() => handleSelectColor(index, color)}
                                  className={`cursor-pointer rounded-xl border-2 p-1 transition flex flex-col items-center bg-white ${
                                    isSelected
                                      ? "border-orange-500 ring-1 ring-orange-500"
                                      : "border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  {imgUrl ? (
                                    <img
                                      src={imgUrl}
                                      alt={color}
                                      className="w-full aspect-[3/4] object-cover rounded-lg mb-1.5"
                                    />
                                  ) : (
                                    <div className="w-full aspect-[3/4] bg-gray-50 rounded-lg flex items-center justify-center mb-1.5 text-[10px] text-gray-400">
                                      Resim Yok
                                    </div>
                                  )}
                                  <span className="text-[11px] font-black text-gray-800 uppercase tracking-tight">{color}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Size Buttons */}
                      {sizes.length > 0 && (
                        <div className="border-t border-gray-100/50 pt-3">
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            {(selectedPackage ?? 0) > 1 ? `${index + 1}. Ürün Bedeni:` : "Beden Seçiniz:"}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {sizes.map((size) => {
                              const isSelected = item.size === size
                              return (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => handleSelectSize(index, size)}
                                  className={`px-4.5 py-2 rounded-lg border-2 text-xs font-extrabold uppercase transition ${
                                    isSelected
                                      ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                                  }`}
                                >
                                  {size}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: GÖNDERİ BİLGİLERİNİ GİRİN */}
              <div ref={shippingFormRef} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <div className="border-b border-gray-100 pb-3 mb-4">
                  <h2 className="text-base font-black text-gray-900 uppercase text-center tracking-wide">
                    📍 GÖNDERİ BİLGİLERİNİ GİRİN
                  </h2>
                  <p className="text-gray-400 text-[11px] text-center mt-0.5">
                    Lütfen teslimat adresinizi eksiksiz doldurun.
                  </p>
                </div>

                {errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-700 rounded-xl p-3.5 text-xs font-bold mb-4">
                    ⚠️ {errorMessage}
                  </div>
                )}

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Adı Soyadı</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Adınız ve Soyadınız"
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white text-xs font-semibold"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <div className="bg-slate-50 border border-gray-200 rounded-xl px-4 py-2 focus-within:border-orange-500 focus-within:bg-white transition-all">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Telefon</label>
                      <div className="flex items-center">
                        <div className="flex items-center gap-1.5 pr-2.5 border-r border-gray-200 shrink-0">
                          <svg viewBox="0 0 300 200" className="w-5 h-3.5 shrink-0 rounded-xs shadow-xs">
                            <rect width="300" height="200" fill="#e30a17" />
                            <path d="M100,100 m-50,0 a50,50 0 1,0 100,0 a50,50 0 1,0 -100,0 Z" fill="#fff" />
                            <path d="M112.5,100 m-40,0 a40,40 0 1,0 80,0 a40,40 0 1,0 -80,0 Z" fill="#e30a17" />
                            <polygon points="143.8,100 135,102.9 137.8,93.8 130,88.2 139.7,88.2 143.8,79 147.8,88.2 157.5,88.2 149.7,93.8 152.5,102.9" fill="#fff" transform="rotate(-30 143.8 100)" />
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-2.5 h-2.5 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                          <span className="text-xs font-bold text-gray-800 ml-1">+90</span>
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="5XX XXX XX XX"
                          className="flex-1 bg-transparent border-0 py-1.5 px-3 text-gray-800 placeholder-gray-400 focus:outline-none text-xs font-semibold"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">İl</label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={(e) => {
                          const selectedCity = e.target.value
                          setFormData((prev) => ({
                            ...prev,
                            city: selectedCity,
                            district: "",
                          }))
                        }}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-800 focus:outline-none focus:border-orange-500 focus:bg-white text-xs font-semibold cursor-pointer"
                        disabled={isLoading}
                      >
                        <option value="">İl Seçiniz</option>
                        {Object.keys(TURKEY_ADDRESS_DATA).map((prov) => (
                          <option key={prov} value={prov}>
                            {prov}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">İlçe</label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-800 focus:outline-none focus:border-orange-500 focus:bg-white text-xs font-semibold cursor-pointer"
                        disabled={isLoading || !formData.city}
                      >
                        <option value="">İlçe Seçiniz</option>
                        {formData.city &&
                          TURKEY_ADDRESS_DATA[formData.city]?.map((dist) => (
                            <option key={dist} value={dist}>
                              {dist}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Açık Adres</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Mahalle, sokak, no, daire vb."
                      rows={3}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white text-xs font-semibold resize-none"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: ÖDEME TÜRÜNÜ SEÇİN */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <div className="border-b border-gray-100 pb-3 mb-4">
                  <h2 className="text-base font-black text-gray-900 uppercase text-center tracking-wide">
                    💳 ÖDEME TÜRÜNÜ SEÇİN
                  </h2>
                  <p className="text-gray-400 text-[11px] text-center mt-0.5">
                    Ürünü teslim alırken güvenli ödeme yapabilirsiniz.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "cash", label: "Kapıda Nakit Ödeme" },
                    { id: "card", label: "Kapıda Kredi Kartı" },
                  ].map((method) => (
                    <div
                      key={method.id}
                      onClick={() => {
                        if (!isLoading) {
                          setFormData((prev) => ({ ...prev, paymentMethod: method.id }))
                          
                          // Trigger AddPaymentInfo only once per method ID selection
                          if (!trackedAddPaymentInfoRef.current[method.id]) {
                            trackedAddPaymentInfoRef.current[method.id] = true
                            trackAddPaymentInfo({
                              cart: {
                                id: "temp_cart",
                                total: currentPrice,
                                currency: displayCurrency,
                                items: selectedItems.map((item, idx) => ({
                                  id: product.id + "-" + item.color + "-" + item.size,
                                  title: `${product.title} (${item.color} / ${item.size})`,
                                  quantity: 1,
                                  unit_price: (currentPrice / (selectedPackage || 1)) * 100
                                }))
                              },
                              paymentOption: method.label
                            })
                          }
                        }
                      }}
                      className={`p-3 rounded-xl border-2 text-center cursor-pointer transition flex flex-col justify-center items-center ${
                        formData.paymentMethod === method.id
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 font-bold"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xs font-black uppercase tracking-tight">{method.label}</span>
                    </div>
                  ))}
                </div>

                {/* Final Order Action */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleSubmitOrder}
                    disabled={isLoading}
                    className="w-full bg-[#10b981] hover:bg-[#0ea5e9] text-white py-4.5 rounded-xl text-base font-black uppercase tracking-wider shadow-lg shadow-emerald-100 transition transform active:scale-97 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        SİPARİŞİNİZ ALINIYOR...
                      </>
                    ) : (
                      <>
                        SİPARİŞİ TAMAMLA ({currentPrice} {displayCurrency})
                        <svg className="w-5 h-5 text-white stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                  <p className="text-center text-[9px] text-gray-400 mt-2.5">
                    Siparişi Tamamla butonuna basarak Mesafeli Satış Sözleşmesi şartlarını kabul etmiş olursunuz.
                  </p>
                </div>
              </div>

            </div>

            {/* FAQ Accordion */}
            <div className="p-5 bg-white border-t border-gray-100">
              <h3 className="text-sm font-black text-gray-400 mb-4 uppercase tracking-wider text-center">❓ SIKÇA SORULAN SORULAR</h3>
              <div className="space-y-3">
                {[
                  {
                    q: "Kargo ücreti ne kadar?",
                    a: "Kapıda ödeme dahil tüm siparişlerimizde kargo tamamen ücretsizdir. Ekstra hiçbir ücret ödemezsiniz.",
                  },
                  {
                    q: "Kapıda ödemede kredi kartı geçerli mi?",
                    a: "Evet, kurye teslimat esnasında kredi kartınızla tek çekim veya nakit olarak ödeme yapabilirsiniz.",
                  },
                  {
                    q: "Ürün bedeni olmazsa değişim yapabilir miyim?",
                    a: "Tabii ki! 14 gün koşulsuz değişim garantimiz kapsamında müşteri hizmetlerimizle iletişime geçerek kolayca değişim yapabilirsiniz.",
                  },
                  {
                    q: "Siparişim kaç günde teslim edilir?",
                    a: "Büyük şehirlere 1-2 iş günü, diğer bölgelere ise maksimum 3 iş günü içerisinde güvenle teslim edilir.",
                  },
                ].map((faq, idx) => (
                  <details key={idx} className="group border border-gray-100 rounded-2xl p-4 bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer">
                    <summary className="font-bold text-gray-800 text-xs flex justify-between items-center outline-none list-none">
                      {faq.q}
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="p-6 border-t border-gray-100 text-center text-xs text-gray-400 bg-white space-y-2">
          <p>Tüm bilgileriniz 256bit SSL Sertifikası ile korunmaktadır.</p>
          <p>© 2026 Entegreshop Tüm Hakları Saklıdır</p>
        </footer>
      </div>

      {/* Sticky Bottom Order Button */}
      {!isSuccess && (
        <div className="fixed bottom-0 inset-x-0 p-3 bg-white/90 backdrop-blur-md border-t border-gray-100 z-40 max-w-2xl mx-auto shadow-2xl flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase">Toplam Fiyat</span>
            <span className="text-lg font-black text-red-600">{currentPrice} {displayCurrency}</span>
          </div>
          <button
            onClick={scrollToForm}
            className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 text-white py-3.5 px-6 rounded-xl text-sm font-black uppercase tracking-wider shadow-lg animate-pulse hover:shadow-xl transition text-center"
          >
            KAPIDA ÖDEMELİ SİPARİŞ VER
          </button>
        </div>
      )}

      {/* Storefront Review Submission Modal */}
      {showStorefrontReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all max-w-2xl mx-auto">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh] text-zinc-800">
            <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-white flex-shrink-0">
              <span className="text-sm font-extrabold text-zinc-900 uppercase tracking-wide">
                Ürün Değerlendir
              </span>
              <button
                type="button"
                onClick={() => setShowStorefrontReviewModal(false)}
                className="text-zinc-400 hover:text-zinc-600 text-xs font-black uppercase tracking-tight cursor-pointer"
              >
                Kapat
              </button>
            </div>

            {storefrontReviewSuccess ? (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100 animate-bounce">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-base font-black text-emerald-800 uppercase">TEŞEKKÜRLER!</h3>
                <p className="text-xs text-zinc-600 font-bold leading-relaxed max-w-[280px]">
                  Değerlendirmeniz başarıyla gönderildi. Yönetici onayından geçtikten sonra yayınlanacaktır.
                </p>
              </div>
            ) : (
              <form onSubmit={handleStorefrontReviewSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-5 overflow-y-auto space-y-4 text-xs font-semibold text-zinc-700 flex-1">
                  
                  {/* Yıldız Seçimi */}
                  <div className="space-y-1.5 text-center flex flex-col items-center pb-2 border-b border-zinc-50">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Yıldız Puanınız</label>
                    <div className="flex gap-2 text-3xl text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setStorefrontReviewRating(star)}
                          className="hover:scale-110 transition cursor-pointer focus:outline-none"
                        >
                          {star <= storefrontReviewRating ? "★" : "☆"}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-[#9c4d6b] bg-[#9c4d6b]/5 px-2.5 py-0.5 rounded-full mt-1">
                      {storefrontReviewRating} / 5 Yıldız
                    </span>
                  </div>

                  {/* Ad Soyad */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Adınız Soyadınız</label>
                    <input
                      type="text"
                      required
                      value={storefrontReviewName}
                      onChange={(e) => setStorefrontReviewName(e.target.value)}
                      placeholder="Örn: Mehmet A."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-orange-500 text-zinc-800"
                    />
                  </div>

                  {/* Aldığınız Renk */}
                  {colors.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Satın Aldığınız Renk</label>
                      <select
                        value={storefrontReviewColor}
                        onChange={(e) => setStorefrontReviewColor(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-700 focus:outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value="Standart">Standart / Seçilmedi</option>
                        {colors.map((color) => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Yorum */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Değerlendirmeniz (Yorum)</label>
                    <textarea
                      required
                      value={storefrontReviewComment}
                      onChange={(e) => setStorefrontReviewComment(e.target.value)}
                      rows={3}
                      placeholder="Ürün hakkındaki yorumunuz..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-xs font-semibold focus:outline-none focus:border-orange-500 text-zinc-800 resize-none"
                    />
                  </div>

                  {/* Görsel / Video Ekleme */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Görsel / Video Ekle (İsteğe Bağlı)</label>
                    <div className="flex items-center gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-200/50">
                      <div className="relative h-16 w-16 rounded-lg border border-zinc-200 flex-shrink-0 overflow-hidden bg-white flex items-center justify-center">
                        {storefrontReviewMediaUrl ? (
                          storefrontReviewMediaType === "video" ? (
                            <video src={storefrontReviewMediaUrl} className="w-full h-full object-cover" controls={false} />
                          ) : (
                            <img src={storefrontReviewMediaUrl} className="w-full h-full object-cover" alt="Preview" />
                          )
                        ) : (
                          <span className="text-zinc-400 text-lg">📸</span>
                        )}
                        {storefrontReviewUploading && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <span className="text-[9px] font-black text-orange-600 animate-pulse">Yükleniyor</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleStorefrontReviewMediaUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={storefrontReviewUploading}
                          />
                          <button
                            type="button"
                            className="bg-white hover:bg-zinc-50 text-zinc-700 font-bold px-3 py-2 rounded-lg text-[10px] transition border border-zinc-200 cursor-pointer"
                          >
                            Dosya Seç (Fotoğraf/Video)
                          </button>
                        </div>
                        {storefrontReviewMediaUrl && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setStorefrontReviewMediaUrl("")
                                setStorefrontReviewMediaType("image")
                              }}
                              className="text-rose-600 hover:underline text-[9px] font-bold cursor-pointer"
                            >
                              Görseli Temizle
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-2.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowStorefrontReviewModal(false)}
                    className="bg-white border border-zinc-200 text-zinc-600 font-bold px-4.5 py-2.5 rounded-xl text-xs hover:bg-zinc-50 transition cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={storefrontReviewUploading}
                    className="bg-gradient-to-r from-red-600 to-orange-500 text-white font-black px-5 py-2.5 rounded-xl text-xs hover:shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    {storefrontReviewUploading ? "Gönderiliyor..." : "DEĞERLENDİRME GÖNDER"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-20 right-4 md:right-8 z-40 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center focus:outline-none cursor-pointer ${
          showScrollTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="Yukarı Çık"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>

      {/* Validation Popup Toast */}
      {showValidationPopup && (
        <div className="fixed inset-x-4 bottom-24 md:bottom-10 z-[9999] flex justify-center pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md text-white px-6 py-3.5 rounded-full text-xs font-bold shadow-2xl border border-white/10 flex items-center gap-2.5 tracking-wide transition-all duration-300">
            <span>⚠️</span>
            <span>{validationPopupMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}
