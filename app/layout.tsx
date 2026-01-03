import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RAYDAI | Connect Wallet for $50 SOL Giveaway",
  description: "Join RAYDAI AI Staking Platform. Connect your wallet to enter our exclusive $50 SOL giveaway. Premium GPU computing and massive rewards await!",
  icons: {
    icon: "/favicon.png",
  },
  keywords: "RAYDAI, raydai token, AI staking, GPU computing, SOL giveaway, $50 SOL, cryptocurrency, AI mining",
  authors: [{ name: "RAYDAI Team" }],
  openGraph: {
    title: "RAYDAI - Enter $50 SOL Giveaway | AI Staking Platform",
    description: "Connect your wallet to RAYDAI and enter to win $50 SOL. Join our premium AI staking and GPU computing platform today!",
    type: "website",
    url: "https://raydai.com",
    images: ["/preview.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "RAYDAI - $50 SOL Giveaway",
    description: "Connect wallet to enter $50 SOL giveaway. Premium AI staking platform with GPU computing rewards.",
    images: ["/preview.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#8B5CF6" />
      </head>
      <body className="antialiased bg-gray-950">{children}</body>
    </html>
  )
}