'use client';

import { useState } from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { DevelopmentSection } from '@/components/landing/DevelopmentSection';
import { ApproachSection } from '@/components/landing/ApproachSection';
import { WhoSection } from '@/components/landing/WhoSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { JoinWaitlistDialog } from '@/components/landing/JoinWaitlistDialog';
import { ContactUsSheet } from '@/components/landing/ContactUsSheet';

export default function Home() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--light-bg)' }}>
      <LandingHeader
        onJoinWaitlist={() => setWaitlistOpen(true)}
        onContactUs={() => setContactOpen(true)}
      />
      
      <main>
        <HeroSection
          onJoinWaitlist={() => setWaitlistOpen(true)}
          onContactUs={() => setContactOpen(true)}
        />
        
        <AboutSection onJoinWaitlist={() => setWaitlistOpen(true)} />
        
        <DevelopmentSection onJoinWaitlist={() => setWaitlistOpen(true)} />
        
        <ApproachSection />
        
        <WhoSection onJoinWaitlist={() => setWaitlistOpen(true)} />
        
        <LandingFooter
          onJoinWaitlist={() => setWaitlistOpen(true)}
          onContactUs={() => setContactOpen(true)}
        />
      </main>
      
      <JoinWaitlistDialog
        open={waitlistOpen}
        onOpenChange={setWaitlistOpen}
      />
      
      <ContactUsSheet
        open={contactOpen}
        onOpenChange={setContactOpen}
      />
    </div>
  );
}
