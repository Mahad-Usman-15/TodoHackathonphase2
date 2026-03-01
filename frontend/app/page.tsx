import type { Metadata } from "next";
import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import AiSection from "@/components/landing/AiSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import HowItWorks from "@/components/landing/HowItWorks";
import SecuritySection from "@/components/landing/SecuritySection";
import FaqAccordion from "@/components/landing/FaqAccordion";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: {
    absolute: "Taskify — Smart Task Manager",
  },
  description:
    "Taskify helps you manage tasks securely with JWT authentication and a clean, fast interface. Free forever.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Taskify — Smart Task Manager",
    description:
      "Taskify helps you manage tasks securely with JWT authentication and a clean, fast interface. Free forever.",
    url: "/",
    siteName: "Taskify",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Taskify — Smart Task Manager",
    description:
      "Taskify helps you manage tasks securely with JWT authentication and a clean, fast interface. Free forever.",
  },
};

export default function Home() {
  return (
    <main className="bg-brand-bg min-h-screen">
      <LandingNav />
      <HeroSection />
      <AiSection />
      <FeaturesGrid />
      <HowItWorks />
      <SecuritySection />
      <FaqAccordion />
      <LandingFooter />
    </main>
  );
}
