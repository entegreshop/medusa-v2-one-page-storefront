import React, { Suspense } from "react"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import ProductReviews from "@modules/products/components/product-reviews"
import HediyeUrunler from "@modules/products/components/hediye-urunler"
import ProductSchema from "@modules/products/components/product-schema"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const category = (product as any).categories?.[0] || (product as any).collection

  return (
    <>
      <ProductSchema
        product={product}
        region={region}
        countryCode={countryCode}
      />

      {/* SEO Breadcrumbs */}
      <div className="content-container pt-4 pb-2">
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap"
        >
          <LocalizedClientLink
            href="/"
            className="hover:text-black transition-colors"
          >
            Anasayfa
          </LocalizedClientLink>
          <span className="text-gray-300">/</span>
          {category ? (
            <>
              <LocalizedClientLink
                href={`/categories/${category.handle}`}
                className="hover:text-black transition-colors"
              >
                {category.name || category.title}
              </LocalizedClientLink>
              <span className="text-gray-300">/</span>
            </>
          ) : (
            <>
              <LocalizedClientLink
                href="/store"
                className="hover:text-black transition-colors"
              >
                Kadın Giyim
              </LocalizedClientLink>
              <span className="text-gray-300">/</span>
            </>
          )}
          <span className="text-gray-900 font-medium truncate max-w-[260px] sm:max-w-md">
            {product.title}
          </span>
        </nav>
      </div>

      <div
        className="content-container flex flex-col small:flex-row small:items-start py-4 small:py-8 relative gap-8 lg:gap-12"
        data-testid="product-container"
      >
        {/* Left Column (60%): Gallery */}
        <div className="w-full small:w-[60%]">
          <ImageGallery images={images} productTitle={product.title} />
        </div>

        {/* Right Column (40%): Sidebar */}
        <div className="flex flex-col small:sticky small:top-24 w-full small:w-[40%] gap-y-8">
          <ProductActions product={product} region={region}>
            <Suspense fallback={null}>
              <HediyeUrunler product={product} region={region} />
            </Suspense>
          </ProductActions>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="content-container">
        <ProductReviews product={product} />
      </div>

      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
