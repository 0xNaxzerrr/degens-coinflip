import type React from "react"
import type { Metadata } from "next"
import { Toaster } from "sonner"
import "./globals.css"
import SolWrapper from "@/components/SolWrapper"

export const metadata: Metadata = {
  title: "Monkey Flip | Solana Coinflip Game",
  description: "A decentralized Solana-based coinflip game with a monkey theme",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <SolWrapper>
        <body>
          {children}
          <Toaster position="top-right" richColors />
        </body>
      </SolWrapper>
    </html >
  )
}
