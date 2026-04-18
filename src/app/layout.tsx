import React from "react";
import type { Metadata } from "next";
import { Inter, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: 'swap' });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: 'swap' });
const dmMono = DM_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-dm-mono", display: 'swap' });


export const metadata: Metadata = {
  title: "Apexprocure",
  description: "Enterprise Procurement & Supply Chain Solution",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSans.variable} ${dmMono.variable} font-sans`.trim()} suppressHydrationWarning>
        <Providers>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
