import React from "react"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesBento } from "@/components/features-bento"
import { ComposerSandbox } from "@/components/composer-sandbox"
import { ComparisonMatrix } from "@/components/comparison-matrix"
import { SecuritySection } from "@/components/security-section"
import { FaqSection } from "@/components/faq-section"
import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesBento />
        <ComposerSandbox />
        <ComparisonMatrix />
        <SecuritySection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
