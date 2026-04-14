'use client';

import { useState } from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ContactUsSheet } from '@/components/landing/ContactUsSheet';

export default function Home() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--light-bg)' }}>
      <LandingHeader
        onContactUs={() => setContactOpen(true)}
      />
      
      <main>
        <HeroSection
          onContactUs={() => setContactOpen(true)}
        />
        
        <FeaturesSection />
        
        <HowItWorksSection />
        
        <LandingFooter
          onContactUs={() => setContactOpen(true)}
        />
      </main>
      
      <ContactUsSheet
        open={contactOpen}
        onOpenChange={setContactOpen}
      />
    </div>
  );
}
