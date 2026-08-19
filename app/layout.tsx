import type { Metadata } from "next";
import "./globals.css";
import "./icons.css";

const description =
  "Orqestron real estate transaction workspace for forms, files, signatures, and AI-assisted deal management.";

export const metadata: Metadata = {
  title: "Orqestron — Real Estate Transaction Workspace",
  description,
  applicationName: "Orqestron",
  openGraph: {
    title: "Orqestron Workspace",
    description,
    url: "https://pinnacle.local",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orqestron Workspace",
    description,
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
      <body>{children}</body>
    </html>
  );
}
