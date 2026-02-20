import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "بطاقتي - تصميم بطاقات المعلومات المصرفية",
  description: "صمم بطاقة معلومات حسابك المصرفي بشكل احترافي ومشاركها مع عملائك بسهولة",
  keywords: ["بطاقة مصرفية", "ليبيا", "تحويل بنكي", "ONEPAY", "بطاقة معلومات"],
  authors: [{ name: "بطاقتي" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "بطاقتي - تصميم بطاقات المعلومات المصرفية",
    description: "صمم بطاقة معلومات حسابك المصرفي بشكل احترافي",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${notoSansArabic.variable} font-sans antialiased bg-background text-foreground`}
        style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
