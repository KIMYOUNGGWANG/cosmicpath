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
const KOREAN_TITLE = "CosmicPath | 5대 엔진 기반 인생 의사결정 도시에";
const KOREAN_DESCRIPTION = "사주 4주 원국, 서양 점성술 천체도, 자미두수 12궁 명반, 태국 왕실 점성술(108년 마하탁사), 수비학 9년 주기의 5대 계산 엔진을 융합하여 미뤄둔 하나의 선택을 명쾌하게 판정합니다.";
const ENGLISH_TITLE = "CosmicPath | 5-Engine Strategic Decision Dossier";
const ENGLISH_DESCRIPTION = "Synthesizing deterministic Saju, Western Astrology, Ziwei Doushu 12 Palaces, Thai Royal Astrology, and Numerology to deliver an evidence-bound verdict for your critical decision.";

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
      keywords: [
        "CosmicPath",
        "코스믹패스",
        "인생 의사결정",
        "사주 팔자",
        "서양 점성술",
        "자미두수 12궁",
        "태국 점성술",
        "마하탁사",
        "수비학",
        "12개월 운세",
        "이직 타이밍",
        "결정 장애",
        "선택 판정",
        "의사결정 도시에"
      ],
      openGraph: {
        type: "website",
        locale: "ko_KR",
        url: SITE_URL,
        title: KOREAN_TITLE,
        description: KOREAN_DESCRIPTION,
        siteName: "CosmicPath",
        images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "CosmicPath 5대 엔진 의사결정 도시에" }],
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
    keywords: [
      "CosmicPath",
      "Decision Note",
      "Decision Intelligence",
      "Saju",
      "Western Astrology",
      "Ziwei Doushu",
      "Thai Astrology",
      "Numerology",
      "Life Decisions",
      "Career Timing",
      "Timing Roadmap"
    ],
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      title: ENGLISH_TITLE,
      description: ENGLISH_DESCRIPTION,
      siteName: "CosmicPath",
      images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "CosmicPath 5-Engine Decision Dossier" }],
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
