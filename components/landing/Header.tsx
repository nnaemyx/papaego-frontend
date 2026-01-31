'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onOpenWaitlist: () => void;
  onOpenContact: () => void;
}

export function Header({ onOpenWaitlist, onOpenContact }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20 py-6">
        <div className="flex items-center justify-between">
          <Image
            src="/assets/logo.png"
            alt="PapaEgo"
            width={175}
            height={40}
            className="h-10 w-auto"
          />
          
          <div className="flex items-center gap-8">
            <Button
              onClick={onOpenWaitlist}
              className="bg-(--primary-gold) hover:bg-(--primary-gold)/90 text-white landing-button px-6 py-2 rounded-md"
            >
              Join the Waitlist
            </Button>
            <Button
              onClick={onOpenContact}
              variant="outline"
              className="border-2 border-(--primary-gold) text-(--primary-gold) hover:bg-(--primary-gold)/10 landing-button px-6 py-2 rounded-md"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
