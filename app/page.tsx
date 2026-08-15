import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { CategoryCards } from "@/components/home/CategoryCards";
import { PopularBrands } from "@/components/home/PopularBrands";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhyCashALL } from "@/components/home/WhyCashALL";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.cashall.in/#organization",
        "name": "CashALL",
        "alternateName": ["CashALL India", "cashall.in"],
        "url": "https://www.cashall.in/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.cashall.in/photos/CashALL_favicon.png",
          "width": 1024,
          "height": 1024
        },
        "image": "https://www.cashall.in/photos/CashALL_favicon.png",
        "description":
          "CashALL helps you sell your old phones and laptops for the best value with transparent pricing, fast pickup and secure payment."
      },
      {
        "@type": "WebSite",
        "@id": "https://www.cashall.in/#website",
        "url": "https://www.cashall.in/",
        "name": "CashALL",
        "alternateName": ["CashALL India", "cashall.in"],
        "description": "Best Value for Your Old Devices",
        "publisher": {
          "@id": "https://www.cashall.in/#organization"
        },
        "inLanguage": "en-IN"
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-brand-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-grow">
        <Hero />
        <CategoryCards />
        <PopularBrands />
        <HowItWorks />
        <WhyCashALL />
        <FAQAccordion />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
