export const dynamic = "force-dynamic"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import { getLogoConfig } from "@lib/data/logo-config"
import { Metadata } from "next"
import "../styles/globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-plus-jakarta-sans" 
})

export async function generateMetadata(): Promise<Metadata> {
  const logoConfig = await getLogoConfig()
  
  if (logoConfig?.favicon) {
    return {
      icons: {
        icon: logoConfig.favicon,
        shortcut: logoConfig.favicon,
        apple: logoConfig.favicon,
      },
    }
  }

  return {}
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
