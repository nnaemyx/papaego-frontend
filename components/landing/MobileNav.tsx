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

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactUs: () => void;
}

export function MobileNav({
  open,
  onOpenChange,
  onContactUs,
}: MobileNavProps) {
  const handleContactUs = () => {
    onOpenChange(false);
    onContactUs();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
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

        <div className="flex flex-col gap-6 py-8">
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
            Sign Up
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

        <SheetFooter className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-sm">
            <a
              href={LEGAL_LINKS.TERMS_AND_CONDITIONS}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center py-2 hover:underline"
              style={{
                color: 'var(--primary-gold)',
                fontFamily: 'var(--font-bricolage-grotesque)',
              }}
              onClick={() => onOpenChange(false)}
            >
              Terms & Conditions
            </a>
            <a
              href={LEGAL_LINKS.PRIVACY_POLICY}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center py-2 hover:underline"
              style={{
                color: 'var(--primary-gold)',
                fontFamily: 'var(--font-bricolage-grotesque)',
              }}
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
