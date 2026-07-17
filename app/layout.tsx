import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daylight Energy Clone",
  description:
    "A polished Daylight-inspired landing page for solar, storage, lower bills and home backup.",
  openGraph: {
    title: "Daylight Energy Clone",
    description:
      "Solar, storage and backup power in a warm residential energy landing page.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daylight Energy Clone",
    description:
      "Solar, storage and backup power in a warm residential energy landing page.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
