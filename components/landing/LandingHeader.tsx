'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { MobileNav } from './MobileNav';

interface LandingHeaderProps {
  onJoinWaitlist: () => void;
  onContactUs: () => void;
}

export function LandingHeader({ onJoinWaitlist, onContactUs }: LandingHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md' : 'bg-white'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[80px] lg:h-[100px]">
            <div className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="PapaEgo"
                width={175}
                height={40}
                className="h-[32px] lg:h-[40px] w-auto"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <Button
                onClick={() => window.location.href = '/customer-auth/signup'}
                className="landing-button px-6 h-[44px] rounded-lg transition-transform hover:scale-105"
                style={{
                  backgroundColor: 'var(--primary-gold)',
                  color: 'white',
                  fontFamily: 'var(--font-bricolage-grotesque)',
                  fontWeight: 600,
                }}
              >
                Sign Up
              </Button>

              <Button
                onClick={onJoinWaitlist}
                variant="outline"
                className="landing-button px-6 h-[44px] rounded-lg transition-transform hover:scale-105"
                style={{
                  borderColor: 'var(--primary-gold)',
                  color: 'var(--primary-gold)',
                  fontFamily: 'var(--font-public-sans)',
                  fontWeight: 600,
                }}
              >
                Join Waitlist
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" style={{ color: 'var(--primary-gold)' }} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation */}
      <MobileNav
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
        onJoinWaitlist={onJoinWaitlist}
        onContactUs={onContactUs}
      />
    </>
  );
}
