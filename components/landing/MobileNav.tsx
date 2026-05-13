'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { LEGAL_LINKS } from '@/lib/constants/legal';
import { Info, Zap, BadgeDollarSign, HelpCircle, Phone } from 'lucide-react';

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactUs: () => void;
}

const navLinks = [
  { label: 'About Us', href: '#currencies', icon: Info },
  { label: 'Features', href: '#features', icon: Zap },
  { label: 'Pricing', href: null, icon: BadgeDollarSign },
  { label: 'FAQ', href: '#faq', icon: HelpCircle },
];

export function MobileNav({ open, onOpenChange, onContactUs }: MobileNavProps) {
  const handleContactUs = () => {
    onOpenChange(false);
    onContactUs();
  };

  const handleNavClick = (href: string | null) => {
    onOpenChange(false);
    if (!href) {
      // Pricing — open contact sheet after nav closes
      setTimeout(() => onContactUs(), 300);
      return;
    }
    setTimeout(() => {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col">
        <SheetHeader>
          <SheetTitle
            style={{
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: 'var(--primary-gold)',
            }}
          >
            Menu
          </SheetTitle>
        </SheetHeader>

        {/* Nav Links */}
        <div className="flex flex-col gap-1 py-4">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href ?? null)}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-left hover:bg-gray-50 transition-colors"
              style={{
                color: 'var(--text-gray)',
                fontFamily: 'var(--font-bricolage-grotesque)',
                fontWeight: 600,
                fontSize: '15px',
              }}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--primary-gold)' }} />
              {link.label}
            </button>
          ))}
          <button
            onClick={handleContactUs}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-left hover:bg-gray-50 transition-colors"
            style={{
              color: 'var(--text-gray)',
              fontFamily: 'var(--font-bricolage-grotesque)',
              fontWeight: 600,
              fontSize: '15px',
            }}
          >
            <Phone className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--primary-gold)' }} />
            Contact Us
          </button>
        </div>

        <div className="border-t" style={{ borderColor: 'var(--border-custom)' }} />

        {/* Auth Buttons */}
        <div className="flex flex-col gap-3 py-4">
          <Button
            onClick={() => {
              onOpenChange(false);
              window.location.href = '/customer-auth/signup';
            }}
            className="landing-button px-6 h-[52px] rounded-lg transition-transform hover:scale-105 w-full"
            style={{
              backgroundColor: 'var(--primary-gold)',
              color: 'white',
              fontFamily: 'var(--font-bricolage-grotesque)',
              fontWeight: 600,
            }}
          >
            Create Account
          </Button>

          <Button
            onClick={() => {
              onOpenChange(false);
              window.location.href = '/customer-auth/login';
            }}
            variant="outline"
            className="landing-button px-6 h-[52px] rounded-lg transition-transform hover:scale-105 w-full"
            style={{
              borderColor: 'var(--primary-gold)',
              color: 'var(--primary-gold)',
              fontFamily: 'var(--font-public-sans)',
              fontWeight: 600,
            }}
          >
            Login
          </Button>
        </div>

        <SheetFooter className="mt-auto flex flex-col gap-2">
          <div className="flex flex-col gap-1 text-sm">
            <a
              href={LEGAL_LINKS.TERMS_AND_CONDITIONS}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center py-2 hover:underline"
              style={{ color: 'var(--primary-gold)', fontFamily: 'var(--font-bricolage-grotesque)' }}
              onClick={() => onOpenChange(false)}
            >
              Terms &amp; Conditions
            </a>
            <a
              href={LEGAL_LINKS.PRIVACY_POLICY}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center py-2 hover:underline"
              style={{ color: 'var(--primary-gold)', fontFamily: 'var(--font-bricolage-grotesque)' }}
              onClick={() => onOpenChange(false)}
            >
              Privacy Policy
            </a>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
