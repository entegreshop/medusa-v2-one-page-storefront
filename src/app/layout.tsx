export const dynamic = "force-dynamic"
import { Metadata } from "next"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import "../styles/globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
})

import PixelScripts, { fetchStorePixelConfig } from "@modules/layout/components/pixel-scripts"

function cleanVerificationCode(code?: string): string | undefined {
  if (!code) return undefined
  const trimmed = code.trim()
  if (!trimmed) return undefined
  const contentMatch = trimmed.match(/content=["']([^"']+)["']/i)
  if (contentMatch && contentMatch[1]) {
    return contentMatch[1].trim()
  }
  return trimmed.replace(/^<meta[^>]*>/i, "").replace(/<\/meta>$/i, "").trim()
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await fetchStorePixelConfig()
  const se = config?.search_engines
  const otherMeta: Record<string, string> = {}

  if (se?.active !== false) {
    if (se?.facebook_verification) {
      const fb = cleanVerificationCode(se.facebook_verification)
      if (fb) otherMeta["facebook-domain-verification"] = fb
    }
    if (se?.bing_verification) {
      const bing = cleanVerificationCode(se.bing_verification)
      if (bing) otherMeta["msvalidate.01"] = bing
    }
    if (se?.pinterest_verification) {
      const pin = cleanVerificationCode(se.pinterest_verification)
      if (pin) otherMeta["p:domain_verify"] = pin
    }
  }

  const googleVerification = cleanVerificationCode(se?.google_verification)
  const yandexVerification = cleanVerificationCode(se?.yandex_verification)

  return {
    verification: {
      google: se?.active !== false && googleVerification ? googleVerification : undefined,
      yandex: se?.active !== false && yandexVerification ? yandexVerification : undefined,
      other: Object.keys(otherMeta).length > 0 ? otherMeta : undefined,
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <PixelScripts />
        {children}
      </body>
    </html>
  )
}
