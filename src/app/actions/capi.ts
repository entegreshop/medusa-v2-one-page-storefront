"use server"

import { headers, cookies } from "next/headers"

// Fetch pixel config from backend
async function getPixelConfig() {
  try {
    const backendUrl =
      process.env.MEDUSA_BACKEND_URL ||
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
      "https://api.cizgibutik.com"
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
    const reqHeaders: Record<string, string> = {}
    if (publishableKey) {
      reqHeaders["x-publishable-api-key"] = publishableKey
    }
    const res = await fetch(`${backendUrl}/store/pixel-settings`, {
      headers: reqHeaders,
      cache: "no-store",
    })
    const data = await res.json()
    return data?.config?.meta_pixel
  } catch (error) {
    console.error("CAPI Config Fetch Error:", error)
    return null
  }
}

export async function sendMetaCAPIEvent(
  eventName: string,
  eventData: {
    event_id: string
    value?: number
    currency?: string
    content_ids?: string[]
    content_name?: string
  }
) {
  try {
    const metaPixelConfig = await getPixelConfig()

    // Check if CAPI is active and tokens are present
    if (
      !metaPixelConfig ||
      metaPixelConfig.active === false ||
      !metaPixelConfig.pixel_id ||
      !metaPixelConfig.access_token
    ) {
      return { success: false, reason: "CAPI not configured or inactive" }
    }

    const headersList = await headers()
    const cookieStore = await cookies()

    const clientIp =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      ""
    const userAgent = headersList.get("user-agent") || ""
    const fbp = cookieStore.get("_fbp")?.value || ""
    const fbc = cookieStore.get("_fbc")?.value || ""
    const eventSourceUrl = headersList.get("referer") || "https://cizgibutik.com/tr"

    const userData: any = {}
    if (clientIp) userData.client_ip_address = clientIp
    if (userAgent) userData.client_user_agent = userAgent
    if (fbp) userData.fbp = fbp
    if (fbc) userData.fbc = fbc

    if (Object.keys(userData).length === 0) {
      userData.client_ip_address = "192.168.1.1"
      userData.client_user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }

    const payload: any = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventData.event_id || `evt_${Date.now()}`,
      action_source: "website",
      user_data: userData,
      event_source_url: eventSourceUrl,
    }

    if (eventData.value !== undefined || eventData.content_ids?.length) {
      payload.custom_data = {
        value: eventData.value || 0,
        currency: eventData.currency || "TRY",
        content_type: "product",
      }
      if (eventData.content_ids?.length) {
        payload.custom_data.content_ids = eventData.content_ids
      }
      if (eventData.content_name) {
        payload.custom_data.content_name = eventData.content_name
      }
    }

    const bodyData: any = { data: [payload] }
    if (metaPixelConfig.test_event_code && metaPixelConfig.test_event_code.trim().length > 0) {
      bodyData.test_event_code = metaPixelConfig.test_event_code.trim()
    }

    const apiUrl = `https://graph.facebook.com/v19.0/${metaPixelConfig.pixel_id.trim()}/events?access_token=${encodeURIComponent(
      metaPixelConfig.access_token.trim()
    )}`

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    })

    const result = await response.json()
    if (!response.ok) {
      console.error("Meta CAPI Error Response:", result)
      return { success: false, error: result }
    }

    return { success: true, result }
  } catch (error) {
    console.error("Meta CAPI Exception:", error)
    return { success: false, error: String(error) }
  }
}
