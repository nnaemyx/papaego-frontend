'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { RotatingGlobe } from '@/components/animations/RotatingGlobe';

interface HeroSectionProps {
  onJoinWaitlist: () => void;
  onContactUs: () => void;
}

export function HeroSection({ onJoinWaitlist, onContactUs }: HeroSectionProps) {
  return (
    <section
      className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ backgroundColor: 'var(--light-bg)' }}
    >
      {/* Rotating background globe network from Figma - Hidden on mobile */}
      <div className="absolute inset-0 hidden lg:flex items-center justify-end pointer-events-none">
        <div className="relative w-full h-full flex items-center justify-end max-w-[800px] lg:max-w-[900px] -mr-20 lg:-mr-32">
          <RotatingGlobe
            src="/images/hero-removebg-preview.png"
            alt="Global payment network visualization"
            className="w-full max-w-[700px] lg:max-w-[800px]"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-6 lg:space-y-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-4">
              <motion.p
                className="landing-eyebrow"
                style={{ color: 'var(--primary-gold)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Powering Africa&apos;s Global Payments
              </motion.p>

              <motion.h1
                className="landing-hero-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Regulated, Bank-grade Infrastructure for Cross-border Trade Payments
              </motion.h1>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="landing-body" style={{ color: 'var(--text-gray)' }}>
                  PapaEgo is developing compliant settlement infrastructure that will enable individuals and businesses across Africa to send, receive, and settle international payments through trusted global banking systems.
                </p>

                <p className="landing-body" style={{ color: 'var(--text-gray)' }}>
                  The platform is currently under development. We&apos;re working closely with banks, regulators, and payment partners to shape what comes next.
                </p>
              </motion.div>
            </div>

            <motion.div
              className="flex flex-col sm:flex-row flex-wrap gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                onClick={onJoinWaitlist}
                className="landing-button px-8 h-[52px] rounded-lg transition-transform hover:scale-105 w-full sm:w-auto"
                style={{
                  backgroundColor: 'var(--primary-gold)',
                  color: 'white',
                  fontFamily: 'var(--font-bricolage-grotesque)',
                  fontWeight: 600,
                }}
              >
                Join the Waitlist
              </Button>

              <Button
                onClick={onContactUs}
                variant="outline"
                className="landing-button px-8 h-[52px] rounded-lg transition-transform hover:scale-105 w-full sm:w-auto"
                style={{
                  borderColor: 'var(--primary-gold)',
                  color: 'var(--primary-gold)',
                  fontFamily: 'var(--font-public-sans)',
                  fontWeight: 600,
                }}
              >
                Contact Us
              </Button>
            </motion.div>
          </motion.div>

          {/* Right side is empty, background shows the globe */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}
