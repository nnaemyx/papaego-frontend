'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { RotatingGlobe } from '@/components/animations/RotatingGlobe';
import { MapPin } from 'lucide-react';

interface HeroSectionProps {
  onContactUs: () => void;
}

export function HeroSection({ onContactUs }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ backgroundColor: 'var(--light-bg)' }}
    >
      {/* Rotating background globe network - Hidden on mobile */}
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
                Regulated Cross-border Payments for African SMEs
              </motion.h1>

              {/* Nigeria starting badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 }}
              >
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: '#FFF7E6',
                    color: 'var(--primary-gold)',
                    fontFamily: 'var(--font-bricolage-grotesque)',
                    border: '1px solid #F0CD00',
                  }}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  🇳🇬 Starting with Nigeria — more countries coming soon
                </span>
              </motion.div>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="landing-body" style={{ color: 'var(--text-gray)' }}>
                  Send and receive USD, EUR, and GBP across 40+ countries with bank-grade security
                  and transparent FX rates. Built on regulated, compliant infrastructure designed
                  for individuals and businesses across Africa.
                </p>

                <p className="landing-body" style={{ color: 'var(--text-gray)' }}>
                  Start transacting globally with secure, automated, and robust financial solutions.
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
                onClick={() => (window.location.href = '/business/auth/signup')}
                className="landing-button px-8 h-[52px] rounded-lg transition-transform hover:scale-105 w-full sm:w-auto"
                style={{
                  backgroundColor: 'var(--primary-gold)',
                  color: 'white',
                  fontFamily: 'var(--font-bricolage-grotesque)',
                  fontWeight: 600,
                }}
              >
                Register Business
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

          {/* Right side — globe renders in background */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}
