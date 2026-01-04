import type { Metadata } from "next";
import { Cinzel, Outfit, JetBrains_Mono, Gowun_Batang, Noto_Sans_KR } from "next/font/google"; // Premium fonts
import "./globals.css";
import JsonLd from "@/components/seo/json-ld";

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
  title: {
    default: "CosmicPath | AI Driven Destiny Navigation",
    template: "%s | CosmicPath",
  },
  description: "Navigate your destiny with AI-powered Saju, Astrology, and Tarot analysis. Discover your cosmic blueprint.",
  keywords: ["saju", "astrology", "tarot", "fortune telling", "destiny", "AI", "사주", "점성술", "타로", "운세", "궁합"],
  authors: [{ name: "CosmicPath Team" }],
  creator: "CosmicPath",
  publisher: "CosmicPath",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://cosmicpath.app",
    title: "CosmicPath | AI Driven Destiny Navigation",
    description: "Your Sacred Narrative woven through Saju, Astrology, and Tarot. Experience the next generation of destiny analysis.",
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
    description: "Your Sacred Narrative woven through Saju, Astrology, and Tarot.",
    images: ["/og-image.png"],
    creator: "@cosmicpath", // Placeholder
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
