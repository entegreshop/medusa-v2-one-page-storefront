import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "https://api.cizgibutik.com"
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "tr"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    try {
      const headers: Record<string, string> = {}
      if (PUBLISHABLE_API_KEY) {
        headers["x-publishable-api-key"] = PUBLISHABLE_API_KEY
      }
      const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
        headers,
        next: {
          revalidate: 3600,
          tags: [`regions-${cacheId}`],
        },
        cache: "force-cache",
      }).then(async (response) => {
        const json = await response.json()
        if (!response.ok) {
          throw new Error(json.message)
        }
        return json
      })

      if (regions?.length) {
        regions.forEach((region: HttpTypes.StoreRegion) => {
          region.countries?.forEach((c) => {
            regionMapCache.regionMap.set(c.iso_2 ?? "", region)
          })
        })
        regionMapCache.regionMapUpdated = Date.now()
      }
    } catch {}
  }

  return regionMapCache.regionMap
}

async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      return urlCountryCode
    }

    if (regionMap.has(DEFAULT_REGION)) {
      return DEFAULT_REGION
    }

    if (regionMap.has("tr")) {
      return "tr"
    }

    const firstKey = regionMap.keys().next().value
    if (firstKey) {
      return firstKey
    }
  } catch {}
  return "tr"
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Static files, API routes, or XML export feeds pass right through
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/export/") ||
    pathname.startsWith("/xml/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const cacheIdCookie = request.cookies.get("_medusa_cache_id")
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)
  const countryCode = (await getCountryCode(request, regionMap)) || "tr"

  const firstSegment = pathname.split("/")[1]?.toLowerCase()
  const urlHasCountryCode = Boolean(
    firstSegment && (regionMap.has(firstSegment) || firstSegment === "tr")
  )

  // If the URL already starts with a valid country code (e.g. /tr), serve directly without redirecting to itself
  if (urlHasCountryCode) {
    const res = NextResponse.next()
    if (!cacheIdCookie) {
      res.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
        path: "/",
      })
    }
    return res
  }

  const redirectPath = pathname === "/" ? "" : pathname
  const queryString = request.nextUrl.search || ""

  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host")
  const forwardedProto =
    forwardedHost && forwardedHost.includes("cizgibutik.com")
      ? "https"
      : request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "") || "https"

  const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : request.nextUrl.origin
  const redirectUrl = `${origin}/${countryCode}${redirectPath}${queryString}`

  const response = NextResponse.redirect(redirectUrl, 307)
  if (!cacheIdCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
      path: "/",
    })
  }
  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|uploads|png|svg|jpg|jpeg|gif|webp|mp4|mov|webm).*)",
  ],
}
