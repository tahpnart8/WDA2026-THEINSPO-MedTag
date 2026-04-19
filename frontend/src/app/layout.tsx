import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MedTag - Emergency Medical Information",
  description: "Hệ thống thông tin y tế khẩn cấp MedTag",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} font-sans antialiased h-full`}>
      <body className="min-h-full flex flex-col text-lg bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
