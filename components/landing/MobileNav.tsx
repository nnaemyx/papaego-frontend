'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoinWaitlist: () => void;
  onContactUs: () => void;
}

export function MobileNav({
  open,
  onOpenChange,
  onJoinWaitlist,
  onContactUs,
}: MobileNavProps) {
  const handleJoinWaitlist = () => {
    onOpenChange(false);
    onJoinWaitlist();
  };

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
            onClick={handleJoinWaitlist}
            className="landing-button px-6 h-[52px] rounded-lg transition-transform hover:scale-105 w-full"
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
            onClick={handleContactUs}
            variant="outline"
            className="landing-button px-6 h-[52px] rounded-lg transition-transform hover:scale-105 w-full"
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

        <SheetFooter className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-sm">
            <a
              href="#"
              className="text-center py-2 hover:underline"
              style={{
                color: 'var(--primary-gold)',
                fontFamily: 'var(--font-bricolage-grotesque)',
              }}
              onClick={(e) => {
                e.preventDefault();
                onOpenChange(false);
              }}
            >
              Terms & Conditions
            </a>
            <a
              href="#"
              className="text-center py-2 hover:underline"
              style={{
                color: 'var(--primary-gold)',
                fontFamily: 'var(--font-bricolage-grotesque)',
              }}
              onClick={(e) => {
                e.preventDefault();
                onOpenChange(false);
              }}
            >
              Privacy Policy
            </a>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
