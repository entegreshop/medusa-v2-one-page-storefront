export const dynamic = "force-dynamic"
export const revalidate = 0

import { redirect } from "next/navigation"
import { medusa } from "@/lib/medusa"

export default async function Home() {
  let targetHandle = "t-shirt"

  try {
    const { products } = await medusa.store.product.list({
      limit: 1,
    })
    const firstProduct = products?.[0]
    if (firstProduct?.handle) {
      targetHandle = firstProduct.handle
    }
  } catch (error) {
    console.error("Error fetching first product for home redirect:", error)
  }

  redirect(`/${targetHandle}`)
}
