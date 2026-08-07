import type { Metadata } from "next";
import "./globals.css";
import { SupportWidget } from "@/components/common/SupportWidget";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "CashALL — Turn Your Used Device Into Instant Cash | Phone & Laptop Recommerce",
  description:
    "Sell your used smartphone or laptop online with CashALL. Get instant transparent price valuations, fast doorstep pickup, physical verification, and instant direct payment.",
  keywords: [
    "Sell old phone",
    "Sell old laptop",
    "Used laptop price estimate",
    "Cash for phone India",
    "Sell MacBook Air",
    "Doorstep device pickup",
    "Transparent valuation",
  ],
  authors: [{ name: "CashALL Technologies" }],
  openGraph: {
    title: "CashALL — Turn Your Used Phone or Laptop Into Cash",
    description:
      "Instant estimated value, fast doorstep pickup, transparent physical verification, and instant direct payment.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-brand-bg text-brand-black min-h-screen font-sans antialiased">
        {children}
        <SupportWidget />
      </body>
    </html>
  );
}
