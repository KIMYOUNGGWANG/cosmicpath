import type { Metadata } from "next";
import { Cinzel, Outfit } from "next/font/google"; // Premium fonts
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

export const metadata: Metadata = {
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
        className={`${cinzel.variable} ${outfit.variable} antialiased`}
      >

        {children}
      </body>
    </html>
  );
}
