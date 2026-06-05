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
    creator: "Decision Note",
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
      title: { default: "오늘의 결정 정리", template: "%s | Decision Note" },
      description: "미뤄둔 선택 하나를 질문, 기준, 오늘 할 일로 차분하게 정리합니다.",
      keywords: ["사주", "점성술", "타로", "결정 정리", "결정 타이밍", "관계 고민", "커리어 고민", "오늘 할 일"],
      openGraph: {
        type: "website",
        locale: "ko_KR",
        url: process.env.NEXT_PUBLIC_APP_URL || "https://cosmicpath.app",
        title: "오늘의 결정 정리",
        description: "미뤄둔 선택 하나를 질문, 기준, 오늘 할 일로 차분하게 정리합니다.",
        siteName: "오늘의 결정 정리",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Decision note" }],
      },
      twitter: {
        card: "summary_large_image",
        title: "오늘의 결정 정리",
        description: "미뤄둔 선택 하나를 질문, 기준, 오늘 할 일로 차분하게 정리합니다.",
        images: ["/og-image.png"],
        creator: "@decisionnote",
      },
    };
  }

  return {
    ...base,
    title: { default: "Decision Note", template: "%s | Decision Note" },
    description: "Turn one delayed decision into a clear question, criteria, and one careful action for today.",
    keywords: ["saju", "astrology", "tarot", "decision note", "decision timing", "relationship decision", "career decision"],
    openGraph: {
      type: "website",
      locale: "en_US",
      url: process.env.NEXT_PUBLIC_APP_URL || "https://cosmicpath.app",
      title: "Decision Note",
      description: "Turn one delayed decision into a clear question, criteria, and one careful action for today.",
      siteName: "Decision Note",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Decision note" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Decision Note",
      description: "Turn one delayed decision into a clear question, criteria, and one careful action for today.",
      images: ["/og-image.png"],
      creator: "@decisionnote",
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
