'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

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
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-8"
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
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                onClick={onJoinWaitlist}
                className="landing-button px-8 h-[52px] rounded-lg transition-transform hover:scale-105"
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
                className="landing-button px-8 h-[52px] rounded-lg transition-transform hover:scale-105"
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

          <motion.div
            className="relative h-[500px] lg:h-[600px] flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Rotating globe with network connections */}
            <motion.img
              src="/images/hero-bg.png"
              alt="Globe with network connections"
              className="w-full max-w-[600px] h-auto object-contain"
              animate={{ rotate: 360 }}
              transition={{
                duration: 60,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
