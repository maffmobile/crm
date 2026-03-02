import type { Metadata } from "next";
import "./globals.css";
import { NavigationProgress } from "@/components/NavigationProgress";

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
      <body>
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}

