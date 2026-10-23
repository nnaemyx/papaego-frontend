'use client';

import { useState } from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { MetricsStrip } from '@/components/landing/MetricsStrip';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { CurrenciesSection } from '@/components/landing/CurrenciesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ContactUsSheet } from '@/components/landing/ContactUsSheet';

export default function Home() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-pure selection:bg-amber-500/30 selection:text-amber-900">
      {/* Header and Navbar — left completely untouched as instructed */}
      <LandingHeader onContactUs={() => setContactOpen(true)} />

      <main>
        {/* Section 1: Hero with Sovereign Gold Fluid WebGL Shader & 3D Telemetry */}
        <HeroSection onContactUs={() => setContactOpen(true)} />

        {/* Section 2: Key Institutional Metrics Strip */}
        <MetricsStrip />

        {/* Section 3: Value Proposition / Features Grid (id="features") */}
        <FeaturesSection />

        {/* Section 4: Global Corridors & Real-Time Liquidity Calculator (id="currencies") */}
        <CurrenciesSection />

        {/* Section 5: A Simple, Transparent Process (4-Step Settlement Flow) */}
        <HowItWorksSection />

        {/* Section 6: Frequently Asked Questions & Corporate Verification (id="faq") */}
        <FAQSection />

        {/* Section 7: High-Conversion Institutional Call to Action */}
        <CTASection onContactUs={() => setContactOpen(true)} />

        {/* Section 8: Institutional Footer with Regulatory Disclosures */}
        <LandingFooter onContactUs={() => setContactOpen(true)} />
      </main>

      <ContactUsSheet open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
}
