import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import Nav from "@/app/components/Nav"
import Providers from "@/app/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "TravelApp",
  description: "Plan your trip",
  generator: "NextJS",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {/* Wrapped with Session Provider */}
        <Providers>
          {/* Wrapped Nav component and children in Suspense boundary */}
          <Suspense fallback={<div>Loading...</div>}>
            <Nav />
            {children}
          </Suspense>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
