import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import "./globals.css";
import JsonLd from "@/components/seo/json-ld";
import { Analytics } from '@vercel/analytics/react';
import SessionProvider from "@/components/providers/SessionProvider";
import LenisProvider from "@/components/providers/LenisProvider";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const isKorean = (headersList.get('accept-language') || '').includes('ko');

  const base: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://cosmicpath.app"),
    alternates: { canonical: './' },
    authors: [{ name: "Tony's Company" }],
    creator: "Next Move Report",
    publisher: "Next Move Report",
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
    }
  };

  if (isKorean) {
    return {
      ...base,
      title: { default: "Next Move Report | 연락할까, 기다릴까", template: "%s | Next Move Report" },
      description: "관계와 DM 앞에서 지금 연락할지 기다릴지 첫 판정을 제공합니다.",
      keywords: ["saju", "astrology", "tarot", "fortune telling", "destiny", "AI", "AI Fortune", "2026 Prediction", "사주", "점성술", "타로", "운세", "궁합", "2026년 운세", "신년운세", "무료사주", "Data-Driven Destiny", "AI Oracle", "Cosmic MBTI"],
      openGraph: {
        type: "website",
        locale: "ko_KR",
        url: process.env.NEXT_PUBLIC_APP_URL || "https://cosmicpath.app",
        title: "Next Move Report | 연락할까, 기다릴까",
        description: "관계와 DM 앞에서 지금 연락할지 기다릴지 첫 판정을 제공합니다.",
        siteName: "Next Move Report",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Next Move Report" }],
      },
      twitter: {
        card: "summary_large_image",
        title: "Next Move Report | 연락할까, 기다릴까",
        description: "관계와 DM 앞에서 지금 연락할지 기다릴지 첫 판정을 제공합니다.",
        images: ["/og-image.png"],
        creator: "@cosmicpath",
      },
    };
  }

  return {
    ...base,
    title: { default: "Next Move Report | Contact or Wait", template: "%s | Next Move Report" },
    description: "A relationship/DM decision report for whether to contact them or wait.",
    keywords: ["saju", "astrology", "tarot", "fortune telling", "destiny", "AI"],
    openGraph: {
      type: "website",
      locale: "en_US",
      url: process.env.NEXT_PUBLIC_APP_URL || "https://cosmicpath.app",
      title: "Next Move Report | Contact or Wait",
      description: "A relationship/DM decision report for whether to contact them or wait.",
      siteName: "Next Move Report",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Next Move Report" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Next Move Report | Contact or Wait",
      description: "A relationship/DM decision report for whether to contact them or wait.",
      images: ["/og-image.png"],
      creator: "@cosmicpath",
    },
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: 'resizes-content'
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const isKorean = (headersList.get('accept-language') || '').includes('ko');
  const DevConsoleFilter = process.env.NODE_ENV === 'development'
    ? (await import("@/components/providers/DevConsoleFilter")).default
    : null;

  return (
    <html lang={isKorean ? "ko" : "en"} suppressHydrationWarning>
      <body
        className="antialiased"
      >
        <SessionProvider>
          <LenisProvider />
          {DevConsoleFilter ? <DevConsoleFilter /> : null}
          <JsonLd />
          <div className="mx-auto w-full max-w-[1820px] min-h-screen relative">
            {children}
          </div>
          <MobileBottomNav />
          {process.env.NODE_ENV === 'production' ? <Analytics /> : null}
        </SessionProvider>
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}

declare global {
  interface Window {
    Kakao: unknown;
  }
}
