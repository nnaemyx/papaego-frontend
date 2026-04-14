'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import LinkedInIcon from './icons/linkedin.svg';
import FacebookIcon from './icons/facebook.svg';
import InstagramIcon from './icons/instagram.svg';
import TwitterIcon from './icons/twitter.svg';
import { LEGAL_LINKS } from '@/lib/constants/legal';

interface LandingFooterProps {
  onContactUs: () => void;
}

export function LandingFooter({ onContactUs }: LandingFooterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const socialLinks = [
    { icon: LinkedInIcon, href: '#', label: 'LinkedIn' },
    { icon: FacebookIcon, href: '#', label: 'Facebook' },
    { icon: InstagramIcon, href: '#', label: 'Instagram' },
    { icon: TwitterIcon, href: '#', label: 'Twitter' },
  ];

  return (
    <footer 
      ref={ref}
      className="relative py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: 'white' }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex flex-col items-center space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Logo */}
          <Image
            src="/images/logo.png"
            alt="PapaEgo"
            width={175}
            height={40}
            className="h-[32px] lg:h-[40px] w-auto"
          />
          
          {/* Tagline */}
          <p 
            className="landing-body text-center text-sm lg:text-base"
            style={{ 
              color: 'var(--text-gray)',
              fontWeight: 700,
            }}
          >
            Powering Africa&apos;s Global Payment
          </p>
          
          {/* Navigation Links */}
          <div className="flex items-center gap-4 lg:gap-8">
            <button
              onClick={() => window.location.href = '/customer-auth/login'}
              className="landing-button transition-colors hover:opacity-80"
              style={{
                color: 'var(--primary-gold)',
                fontFamily: 'var(--font-bricolage-grotesque)',
                fontWeight: 600,
              }}
            >
              Login
            </button>
            
            <div 
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: 'var(--text-gray)' }}
            />
            
            <button
              onClick={onContactUs}
              className="landing-button transition-colors hover:opacity-80"
              style={{
                color: 'var(--primary-gold)',
                fontFamily: 'var(--font-bricolage-grotesque)',
                fontWeight: 600,
              }}
            >
              Contact Us
            </button>
          </div>
          
          {/* Social Icons */}
          <div className="flex items-center gap-5 lg:gap-7">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                aria-label={social.label}
                className="transition-transform hover:scale-110"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <social.icon 
                  width={24}
                  height={24}
                  className="lg:w-[28px] lg:h-[28px]"
                  style={{ color: 'var(--primary-gold)' }}
                />
              </motion.a>
            ))}
          </div>
          
          {/* Bottom Row */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t" style={{ borderColor: 'var(--border-custom)' }}>
            <p 
              className="landing-body text-xs sm:text-sm text-center sm:text-left"
              style={{ color: 'var(--text-gray)' }}
            >
              © 2026 PapaEgo. All rights reserved.
            </p>
            
            <div className="flex items-center gap-4 sm:gap-6">
              <a
                href={LEGAL_LINKS.TERMS_AND_CONDITIONS}
                target="_blank" rel="noopener noreferrer"
                className="landing-body text-xs sm:text-sm transition-colors hover:opacity-80"
                style={{ color: 'var(--primary-gold)' }}
              >
                Terms & Conditions
              </a>
              <a
                href={LEGAL_LINKS.PRIVACY_POLICY}
                target="_blank" rel="noopener noreferrer"
                className="landing-body text-xs sm:text-sm transition-colors hover:opacity-80"
                style={{ color: 'var(--primary-gold)' }}
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
