import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { CategoryCards } from "@/components/home/CategoryCards";
import { PopularBrands } from "@/components/home/PopularBrands";
import { HowItWorks } from "@/components/home/HowItWorks";
import { AdCarousel } from "@/components/home/AdCarousel";
import { WhyCashALL } from "@/components/home/WhyCashALL";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-brand-black">
      <Header />
      <main className="flex-grow">
        <Hero />
        <CategoryCards />
        <PopularBrands />
        <HowItWorks />
        <AdCarousel />
        <WhyCashALL />
        <FAQAccordion />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
