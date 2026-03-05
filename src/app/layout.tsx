import type { Metadata } from "next";
import "./globals.css";
import JsonLd from "@/components/seo/json-ld";
import { Analytics } from '@vercel/analytics/react';
import SessionProvider from "@/components/providers/SessionProvider";
import LenisProvider from "@/components/providers/LenisProvider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://cosmicpath.app"),
  alternates: {
    canonical: './',
  },
  title: {
    default: "CosmicPath | Data-Driven Destiny & AI Astrology",
    template: "%s | CosmicPath",
  },
  description: "Unseal your destiny with CosmicPath. We combine ancient astrological wisdom with advanced AI to decode your life's blueprint. Discover your Cosmic MBTI and data-driven insights.",
  keywords: ["saju", "astrology", "tarot", "fortune telling", "destiny", "AI", "AI Fortune", "2026 Prediction", "사주", "점성술", "타로", "운세", "궁합", "2026년 운세", "신년운세", "무료사주", "Data-Driven Destiny", "AI Oracle", "Cosmic MBTI"],
  authors: [{ name: "CosmicPath Team" }],
  creator: "CosmicPath",
  publisher: "CosmicPath",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://cosmicpath.app",
    title: "CosmicPath | Data-Driven Destiny & AI Astrology",
    description: "Unseal your destiny with CosmicPath. Ancient wisdom meets AI intelligence in a private, deep-dive analysis.",
    siteName: "CosmicPath",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CosmicPath - Saju • Astrology • Tarot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CosmicPath | Data-Driven Destiny & AI Astrology",
    description: "Unseal your destiny with CosmicPath. Ancient wisdom meets AI intelligence.",
    images: ["/og-image.png"],
    creator: "@cosmicpath",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: 'resizes-content'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased"
      >

        <SessionProvider>
          <LenisProvider>
            <JsonLd />
            {children}
            <Analytics />
          </LenisProvider>
        </SessionProvider>
        <script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          crossOrigin="anonymous"
          defer
        ></script>
      </body>
    </html>
  );
}

declare global {
  interface Window {
    Kakao: unknown;
  }
}
