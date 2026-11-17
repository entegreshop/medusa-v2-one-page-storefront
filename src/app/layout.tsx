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

export async function generateMetadata(): Promise<Metadata> {
  const config = await fetchStorePixelConfig()
  const se = config?.search_engines
  const otherMeta: Record<string, string> = {}

  if (se?.active !== false) {
    if (se?.facebook_verification) {
      otherMeta["facebook-domain-verification"] = se.facebook_verification
    }
    if (se?.bing_verification) {
      otherMeta["msvalidate.01"] = se.bing_verification
    }
    if (se?.pinterest_verification) {
      otherMeta["p:domain_verify"] = se.pinterest_verification
    }
  }

  return {
    verification: {
      google: se?.active !== false && se?.google_verification ? se.google_verification : undefined,
      yandex: se?.active !== false && se?.yandex_verification ? se.yandex_verification : undefined,
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
