import type { Metadata } from "next";
import { Cinzel, Outfit, JetBrains_Mono, Gowun_Batang, Noto_Sans_KR } from "next/font/google"; // Premium fonts
import "./globals.css";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "CosmicPath | AI Driven Destiny Navigation",
  description: "Navigate your destiny with AI-powered Saju, Astrology, and Tarot analysis.",
  keywords: ["saju", "astrology", "tarot", "fortune telling", "destiny", "AI", "사주", "점성술", "타로"],
  openGraph: {
    type: "website",
    title: "CosmicPath | AI Driven Destiny Navigation",
    description: "Your Sacred Narrative woven through Saju, Astrology, and Tarot",
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
    description: "Your Sacred Narrative woven through Saju, Astrology, and Tarot",
    images: ["/og-image.png"],
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
