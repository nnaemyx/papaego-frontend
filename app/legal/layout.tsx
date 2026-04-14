"use client";

import { useState } from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ContactUsSheet } from "@/components/landing/ContactUsSheet";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader onContactUs={() => setContactOpen(true)} />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {children}
      </main>
      <LandingFooter onContactUs={() => setContactOpen(true)} />
      <ContactUsSheet open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
}
