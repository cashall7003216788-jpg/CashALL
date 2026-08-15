import type { Metadata } from "next";
import "./globals.css";
import { SupportWidget } from "@/components/common/SupportWidget";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cashall.in"),

  title: {
    default: "CashALL | Best Value for Your Old Devices",
    template: "%s | CashALL",
  },

  description:
    "CashALL helps you sell your old phones and laptops for the best value. Get a transparent price, fast pickup and secure payment for your old devices.",

  keywords: [
    "CashALL",
    "CashALL India",
    "sell old phone",
    "sell old mobile",
    "sell old laptop",
    "sell used phone",
    "sell used laptop",
    "old device resale",
    "sell electronics",
    "phone resale",
    "laptop resale",
  ],

  authors: [
    {
      name: "CashALL",
    },
  ],

  creator: "CashALL",
  publisher: "CashALL",

  alternates: {
    canonical: "https://www.cashall.in/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.cashall.in/",
    siteName: "CashALL",
    title: "CashALL | Best Value for Your Old Devices",
    description:
      "Sell your old phones and laptops with CashALL. Get the best value, fast pickup and secure payment.",
    images: [
      {
        url: "/photos/CashALL_logo.png",
        width: 1200,
        height: 630,
        alt: "CashALL - Best Value for Your Old Devices",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "CashALL | Best Value for Your Old Devices",
    description:
      "Sell your old phones and laptops with CashALL. Get the best value, fast pickup and secure payment.",
    images: ["/photos/CashALL_logo.png"],
  },

  icons: {
    icon: [
      { url: "/photos/CashALL_favicon.png", sizes: "1024x1024", type: "image/png" },
      { url: "/favicon.png", sizes: "1024x1024", type: "image/png" },
    ],
    shortcut: "/photos/CashALL_favicon.png",
    apple: "/photos/CashALL_favicon.png",
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
