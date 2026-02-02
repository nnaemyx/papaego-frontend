'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { RotatingGlobe } from '@/components/animations/RotatingGlobe';

interface DevelopmentSectionProps {
  onJoinWaitlist: () => void;
}

export function DevelopmentSection({ onJoinWaitlist }: DevelopmentSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ backgroundColor: 'var(--light-bg)' }}
    >
      {/* Rotating background network diagram from Figma - Hidden on mobile */}
      <div className="absolute inset-0 hidden lg:flex items-center justify-end pointer-events-none">
        <div className="relative w-full h-full flex items-center justify-end max-w-[700px] lg:max-w-[800px] -mr-10 lg:-mr-20">
          <RotatingGlobe
            src="/images/networking-concept-still-life-assortment_1-removebg-preview.png"
            alt="Payment network connections"
            className="w-full max-w-[600px] lg:max-w-[700px]"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            className="space-y-6 lg:space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-4">
              <p
                className="landing-eyebrow"
                style={{ color: 'var(--primary-gold)' }}
              >
                What We&apos;re Developing
              </p>

              <h2
                className="landing-section-title"
                style={{ color: 'var(--dark-blue)' }}
              >
                The Next Phase of Cross-Border Payments
              </h2>

              <div className="space-y-4">
                <p className="landing-body" style={{ color: 'var(--text-gray)' }}>
                  We are currently developing the next phase of PapaEgo&apos;s cross-border payments infrastructure.
                </p>

                <p className="landing-body" style={{ color: 'var(--text-gray)' }}>
                  During this stage, we are actively engaging with stakeholders across Africa and Asia — including banks, regulators, payment partners, and trade participants — to ensure the platform is practical, compliant, and aligned with real-world payment needs for both individuals and businesses.
                </p>

                <p className="landing-body" style={{ color: 'var(--text-gray)' }}>
                  Joining the waitlist provides early visibility into our progress and future access.
                </p>
              </div>
            </div>

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
          </motion.div>

          {/* Right side is empty, background shows the network */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}
