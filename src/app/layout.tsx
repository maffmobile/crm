import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maffmobile CRM",
  description: "Maffmobile uchun CRM tizimi - buyurtmalar, mijozlar, mahsulotlar boshqaruvi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
