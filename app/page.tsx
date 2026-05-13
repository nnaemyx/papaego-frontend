'use client';

import { useState } from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { CurrenciesSection } from '@/components/landing/CurrenciesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ContactUsSheet } from '@/components/landing/ContactUsSheet';

export default function Home() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--light-bg)' }}>
      <LandingHeader onContactUs={() => setContactOpen(true)} />

      <main>
        {/* Hero */}
        <HeroSection onContactUs={() => setContactOpen(true)} />

        {/* Features — id="features" is set inside the component */}
        <FeaturesSection />

        {/* Currencies & Global Coverage */}
        <CurrenciesSection />

        {/* How It Works */}
        <HowItWorksSection />

        {/* FAQ — id="faq" */}
        <FAQSection />

        <LandingFooter onContactUs={() => setContactOpen(true)} />
      </main>

      <ContactUsSheet open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
}
