import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import "./globals.css";
import JsonLd from "@/components/seo/json-ld";
import { Analytics } from '@vercel/analytics/next';
import SessionProvider from "@/components/providers/SessionProvider";
import LenisProvider from "@/components/providers/LenisProvider";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

const SITE_URL = "https://www.cosmicpath.app";
const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;
const KOREAN_TITLE = "CosmicPath Decision Note | 미뤄둔 선택 하나를 판정";
const KOREAN_DESCRIPTION = "사주로 구조를 보고, 점성으로 타이밍을 보고, 타로로 지금 질문의 즉각 신호를 확인해 하나의 질문을 판정합니다.";
const ENGLISH_TITLE = "CosmicPath Decision Note | One delayed choice, one verdict";
const ENGLISH_DESCRIPTION = "CosmicPath Decision Note cross-checks Saju structure, astrology timing, and tarot's immediate signal before naming the next move.";

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
      keywords: ["Decision Note", "결정 정리", "선택 판정", "사주", "점성술", "타로", "관계 고민", "커리어 고민", "돈 흐름", "다음 행동"],
      openGraph: {
        type: "website",
        locale: "ko_KR",
        url: SITE_URL,
        title: KOREAN_TITLE,
        description: KOREAN_DESCRIPTION,
        siteName: "CosmicPath",
        images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "CosmicPath Decision Note 미리보기" }],
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
    keywords: ["Decision Note", "decision timing", "saju", "astrology", "tarot", "relationship decision", "career decision"],
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      title: ENGLISH_TITLE,
      description: ENGLISH_DESCRIPTION,
      siteName: "CosmicPath",
      images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "CosmicPath Decision Note preview" }],
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
