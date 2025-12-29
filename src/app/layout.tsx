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
