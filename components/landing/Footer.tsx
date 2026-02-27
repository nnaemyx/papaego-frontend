'use client';

import Image from 'next/image';

interface FooterProps {
  onOpenWaitlist: () => void;
  onOpenContact: () => void;
}

export function Footer({ onOpenWaitlist, onOpenContact }: FooterProps) {
  return (
    <footer className="bg-white py-16 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20">
        {/* Logo and tagline */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/assets/logo.png"
              alt="PapaEgo"
              width={175}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <p className="landing-body font-semibold text-gray-800">
            Powering Africa&apos;s Global Payment
          </p>
        </div>

        {/* Navigation links */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <button
            onClick={onOpenWaitlist}
            className="landing-button text-(--primary-gold) hover:underline"
          >
            Join Waitlist
          </button>
          <div className="w-1 h-1 rounded-full bg-gray-800" />
          <button
            onClick={onOpenContact}
            className="landing-button text-(--primary-gold) hover:underline"
          >
            Contact Us
          </button>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <p className="landing-body text-gray-800 text-sm">
            © 2026 PapaEgo. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-7">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-(--primary-gold) flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <Image
                src="/assets/social-linkedin.svg"
                alt="LinkedIn"
                width={16}
                height={16}
                className="w-4 h-4"
              />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-(--primary-gold) flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <Image
                src="/assets/social-facebook.svg"
                alt="Facebook"
                width={16}
                height={16}
                className="w-4 h-4"
              />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-(--primary-gold) flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <Image
                src="/assets/social-instagram.svg"
                alt="Instagram"
                width={16}
                height={16}
                className="w-4 h-4"
              />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-(--primary-gold) flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <Image
                src="/assets/social-x.svg"
                alt="X"
                width={16}
                height={16}
                className="w-4 h-4"
              />
            </a>
          </div>

          {/* Legal links */}
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="landing-button text-(--primary-gold) hover:underline text-sm"
            >
              Terms & Conditions
            </a>
            <a
              href="#"
              className="landing-button text-(--primary-gold) hover:underline text-sm"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
