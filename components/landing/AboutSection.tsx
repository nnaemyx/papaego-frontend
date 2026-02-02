'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

interface AboutSectionProps {
  onJoinWaitlist: () => void;
}

export function AboutSection({ onJoinWaitlist }: AboutSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section 
      ref={ref}
      className="relative py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: 'var(--dark-bg)' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            className="relative h-[300px] lg:h-[400px] order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Image
              src="/images/currency-map.png"
              alt="Global currency map"
              fill
              className="object-contain"
            />
          </motion.div>
          
          <motion.div
            className="space-y-6 lg:space-y-8 order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="space-y-4">
              <p
                className="landing-eyebrow"
                style={{ color: 'var(--primary-gold)' }}
              >
                About PapaEgo
              </p>
              
              <h2
                className="landing-section-title"
                style={{ color: 'white' }}
              >
                Designed for Global Payments. Built with Compliance in Mind.
              </h2>
              
              <div className="space-y-4">
                <p className="landing-body" style={{ color: 'white' }}>
                  PapaEgo is developing regulated cross-border payment infrastructure to support international payments for individuals, businesses, and trade participants across Africa.
                </p>
                
                <p className="landing-body" style={{ color: 'white' }}>
                  Our approach focuses on integrating African-origin payment flows into global banking systems — with the aim of reducing friction, settlement failures, and operational risk, while meeting institutional compliance expectations.
                </p>
                
                <p className="landing-body" style={{ color: 'white' }}>
                  The infrastructure is being designed to support legitimate personal and commercial payments, transparency, and scale.
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
        </div>
      </div>
    </section>
  );
}
