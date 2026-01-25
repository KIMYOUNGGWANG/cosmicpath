import type { Metadata } from "next";
import { Cinzel, Outfit, JetBrains_Mono, Gowun_Batang, Noto_Sans_KR } from "next/font/google"; // Premium fonts
import "./globals.css";
import JsonLd from "@/components/seo/json-ld";
import { Analytics } from '@vercel/analytics/react';

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const gowunBatang = Gowun_Batang({
  subsets: ["latin"],
  weight: ['400', '700'],
  variable: "--font-gowun-batang",
  display: "swap",
});

const notosanskr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: "--font-noto-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://cosmicpath.app"),
  alternates: {
    canonical: './',
  },
  title: {
    default: "CosmicPath | AI Driven Destiny Navigation",
    template: "%s | CosmicPath",
  },
  description: "Unlock your 2026 destiny with CosmicPath. Ancient wisdom meets AI intelligence in a private, deep-dive analysis. The Astral Architect awaits.",
  keywords: ["saju", "astrology", "tarot", "fortune telling", "destiny", "AI", "AI Fortune", "2026 Prediction", "사주", "점성술", "타로", "운세", "궁합", "2026년 운세", "신년운세", "무료사주"],
  authors: [{ name: "CosmicPath Team" }],
  creator: "CosmicPath",
  publisher: "CosmicPath",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://cosmicpath.app",
    title: "CosmicPath | AI Driven Destiny Navigation",
    description: "Unlock your 2026 destiny with CosmicPath. Ancient wisdom meets AI intelligence in a private, deep-dive analysis.",
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
    title: "CosmicPath | AI Driven Destiny Navigation",
    description: "Unlock your 2026 destiny with CosmicPath. Ancient wisdom meets AI intelligence.",
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
        className={`${cinzel.variable} ${outfit.variable} ${gowunBatang.variable} ${notosanskr.variable} ${jetbrainsMono.variable} antialiased`}
      >

        <JsonLd />
        {children}
        <Analytics />
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
    Kakao: any;
  }
}
