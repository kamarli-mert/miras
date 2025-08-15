import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Osmanlıca-Türkçe Çeviri | AI Powered Translation",
  description: "Osmanlıca metinleri modern Türkçeye yapay zeka destekli çeviri sistemi ile anında çevirin.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
