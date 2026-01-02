import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Solana Wallet Connect",
  description: "Connect your Solana wallet",
  icons: {
    icon: "/favicon.ico",
  },//ТУТ КОРОЧЕ УКАЖЕШЬ ФАВИКОНКУ СВОЮ ОНА БУДЕТ ОТОБРАЖАТЬСЯ ПРИ ПОДКЛЮЧЕНИИ КОШЕЛЬКА МОЖЕШЬ ИСПОЛЬЗОВАТЬ ВАЩЕ ЛЮБЫЕ ФОРМАТЫ ICO PNG JPG JPEG
    generator: 'solanaapp'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>{children}</body>
    </html>
  )
}
