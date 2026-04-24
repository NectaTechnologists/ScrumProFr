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

export const metadata = {
  title: 'Gainline — No Talent Goes Unseen',
  description: 'Gainline gives every rugby player a professional digital profile — and gives agents the tools to manage, present and place their players. Wherever the game takes you.',
  openGraph: {
    title: 'Gainline — No Talent Goes Unseen',
    description: 'The digital platform for rugby player pathways. Build your free profile today.',
    url: 'https://www.gainline.pro',
    siteName: 'Gainline',
    images: [
      {
        url: 'https://www.gainline.pro/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Gainline — No Talent Goes Unseen',
      }
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gainline — No Talent Goes Unseen',
    description: 'The digital platform for rugby player pathways.',
    images: ['https://www.gainline.pro/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
