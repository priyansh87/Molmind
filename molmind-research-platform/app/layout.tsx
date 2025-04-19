import type React from "react"
import type { Metadata } from "next/types"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { GlobalLoadingProvider } from "@/components/global-loading-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MOLMIND - AI-powered Molecular Research",
  description: "Your AI Lab for Molecular Discovery",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <GlobalLoadingProvider>
          {children}
          <Toaster />
        </GlobalLoadingProvider>
      </body>
    </html>
  )
}


import './globals.css'