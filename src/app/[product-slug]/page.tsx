export const dynamic = "force-dynamic"
export const revalidate = 0

import { medusa } from "@/lib/medusa"
import ProductLandingPage from "@/components/ProductLandingPage"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{
    "product-slug": string
  }>
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params
  const slug = resolvedParams["product-slug"]
  
  let products;
  try {
    const response = await medusa.store.product.list({
      handle: slug,
      fields: "*variants,+variants.values,+variants.options,+metadata",
      limit: 1,
    })
    products = response.products
  } catch (error) {
    console.error("Error fetching product:", error)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <div className="rounded-2xl bg-white p-8 shadow-xl max-w-md border border-gray-100">
          <h1 className="text-2xl font-bold text-red-500">Bağlantı Hatası</h1>
          <p className="mt-4 text-gray-600">
            Ürün yüklenirken bir sorun yaşandı. Lütfen Medusa backend servisinin (port 9001) aktif olduğundan emin olun.
          </p>
        </div>
      </div>
    )
  }

  const product = products?.[0]
  if (!product) {
    return notFound()
  }

  return <ProductLandingPage product={product} />
}
