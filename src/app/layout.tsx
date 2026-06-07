import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import "./globals.css";
import JsonLd from "@/components/seo/json-ld";
import { Analytics } from '@vercel/analytics/react';
import SessionProvider from "@/components/providers/SessionProvider";
import LenisProvider from "@/components/providers/LenisProvider";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

const SITE_URL = "https://www.cosmicpath.app";
const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;
const KOREAN_TITLE = "CosmicPath | 사주·점성술·타로 3단분석";
const KOREAN_DESCRIPTION = "막힌 관계·일·돈 질문을 사주, 점성술, 타로로 대조해 첫 판정과 다음 행동을 정리합니다.";
const ENGLISH_TITLE = "CosmicPath | Saju, Astrology, Tarot 3-Layer Reading";
const ENGLISH_DESCRIPTION = "A 3-layer reading that cross-checks saju, astrology, and tarot to clarify one stuck question and the next action.";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const isKorean = (headersList.get('accept-language') || '').includes('ko');

  const base: Metadata = {
    metadataBase: new URL(SITE_URL),
    applicationName: "CosmicPath",
    alternates: { canonical: './' },
    authors: [{ name: "Tony's Company" }],
    creator: "CosmicPath",
    publisher: "Tony's Company",
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
      title: { default: KOREAN_TITLE, template: "%s | CosmicPath" },
      description: KOREAN_DESCRIPTION,
      keywords: ["사주", "점성술", "타로", "3단분석", "운세 리포트", "관계 고민", "커리어 고민", "돈 흐름", "다음 행동"],
      openGraph: {
        type: "website",
        locale: "ko_KR",
        url: SITE_URL,
        title: KOREAN_TITLE,
        description: KOREAN_DESCRIPTION,
        siteName: "CosmicPath",
        images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "CosmicPath 사주·점성술·타로 3단분석 미리보기" }],
      },
      twitter: {
        card: "summary_large_image",
        title: KOREAN_TITLE,
        description: KOREAN_DESCRIPTION,
        images: [OG_IMAGE_URL],
      },
    };
  }

  return {
    ...base,
    title: { default: ENGLISH_TITLE, template: "%s | CosmicPath" },
    description: ENGLISH_DESCRIPTION,
    keywords: ["saju", "astrology", "tarot", "3-layer reading", "decision timing", "relationship reading", "career reading"],
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      title: ENGLISH_TITLE,
      description: ENGLISH_DESCRIPTION,
      siteName: "CosmicPath",
      images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "CosmicPath saju, astrology, and tarot 3-layer reading preview" }],
    },
    twitter: {
      card: "summary_large_image",
      title: ENGLISH_TITLE,
      description: ENGLISH_DESCRIPTION,
      images: [OG_IMAGE_URL],
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
