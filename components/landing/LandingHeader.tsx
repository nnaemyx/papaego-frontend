'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface LandingHeaderProps {
  onJoinWaitlist: () => void;
  onContactUs: () => void;
}

export function LandingHeader({ onJoinWaitlist, onContactUs }: LandingHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white'
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[100px]">
          <div className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="PapaEgo"
              width={175}
              height={40}
              className="h-[40px] w-auto"
            />
          </div>

          <div className="flex items-center gap-8">
            <Button
              onClick={onJoinWaitlist}
              className="landing-button px-6 h-[44px] rounded-lg transition-transform hover:scale-105"
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
              className="landing-button px-6 h-[44px] rounded-lg transition-transform hover:scale-105"
              style={{
                borderColor: 'var(--primary-gold)',
                color: 'var(--primary-gold)',
                fontFamily: 'var(--font-public-sans)',
                fontWeight: 600,
              }}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
