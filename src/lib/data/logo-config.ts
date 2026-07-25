const NEXT_PUBLIC_MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.cizgibutik.com"

export async function getLogoConfig() {
  try {
    const res = await fetch(`${NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/logo-config`, {
      cache: "no-store",
    })
    const data = await res.json()
    return data?.config || null
  } catch (err) {
    console.error("Failed to fetch logo config:", err)
    return null
  }
}
