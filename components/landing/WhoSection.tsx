'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import CheckIcon from './icons/check-icon.svg';

interface WhoSectionProps {
  onJoinWaitlist: () => void;
}

export function WhoSection({ onJoinWaitlist }: WhoSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const userTypes = [
    'Individuals sending money internationally',
    'Businesses making or receiving global payments',
    'Banks and financial institutions',
    'Regulators and compliance teams',
    'Trade, liquidity, and settlement partners',
  ];

  return (
    <section 
      ref={ref}
      className="relative py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: 'var(--primary-gold)' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-6">
              <p
                className="landing-eyebrow"
                style={{ color: 'white' }}
              >
                Who This Is For
              </p>
              
              <h2
                className="landing-section-title"
                style={{ color: 'white' }}
              >
                Who Should Join the Waitlist
              </h2>
              
              <p className="landing-body" style={{ color: 'white', fontWeight: 700 }}>
                PapaEgo is being developed for a wide range of users involved in cross-border payments, including:
              </p>
              
              <div className="space-y-4">
                {userTypes.map((type, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <CheckIcon 
                      width={20}
                      height={20}
                      style={{ color: 'var(--bright-yellow)' }}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <p className="landing-body" style={{ color: 'white' }}>
                      {type}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <Button
              onClick={onJoinWaitlist}
              className="landing-button px-8 h-[52px] rounded-lg transition-transform hover:scale-105"
              style={{
                backgroundColor: 'white',
                color: 'var(--primary-gold)',
                fontFamily: 'var(--font-bricolage-grotesque)',
                fontWeight: 600,
              }}
            >
              Join the Waitlist
            </Button>
          </motion.div>
          
          <motion.div
            className="relative h-[500px]"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Image
              src="/images/waitlist-illustration.png"
              alt="Waitlist illustration"
              fill
              className="object-contain"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
