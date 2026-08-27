import type { Metadata } from "next";
import "./globals.css";
import { SupportWidget } from "@/components/common/SupportWidget";
import Script from "next/script";
import { Suspense } from "react";
import { MetaPageViewTracker } from "@/components/analytics/MetaPageViewTracker";

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
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
        >
          {`
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');

      fbq('init', '1037780558881291');
      fbq('track', 'PageView');
    `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1037780558881291&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <Suspense fallback={null}>
          <MetaPageViewTracker />
        </Suspense>
        {children}
        <SupportWidget />
      </body>
    </html>
  );
}
