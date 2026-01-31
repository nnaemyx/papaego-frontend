'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ContactUsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactUsSheet({ open, onOpenChange }: ContactUsSheetProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      onOpenChange(false);
      setSubmitted(false);
      setFormData({ name: '', email: '', company: '', message: '' });
    }, 2000);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
            Contact Us
          </SheetTitle>
          <SheetDescription>
            Have questions about PapaEgo? We&apos;d love to hear from you.
          </SheetDescription>
        </SheetHeader>
        
        {submitted ? (
          <div className="py-8 text-center">
            <div className="mb-4 text-5xl">✓</div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
              Message Sent!
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>
              We&apos;ll get back to you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Full Name *</Label>
              <Input
                id="contact-name"
                type="text"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email Address *</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="john@company.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact-company">Company / Organization</Label>
              <Input
                id="contact-company"
                type="text"
                placeholder="Company Name"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message *</Label>
              <Textarea
                id="contact-message"
                placeholder="Tell us about your inquiry..."
                rows={5}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full landing-button"
              style={{ 
                backgroundColor: 'var(--primary-gold)',
                color: 'white',
                fontFamily: 'var(--font-bricolage-grotesque)'
              }}
            >
              Send Message
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
