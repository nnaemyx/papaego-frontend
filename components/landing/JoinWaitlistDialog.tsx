'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface JoinWaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinWaitlistDialog({ open, onOpenChange }: JoinWaitlistDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userType: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Waitlist form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      onOpenChange(false);
      setSubmitted(false);
      setFormData({ name: '', email: '', userType: '' });
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
            Join the Waitlist
          </DialogTitle>
          <DialogDescription>
            Get early access to PapaEgo&apos;s cross-border payment infrastructure. We&apos;ll notify you when we launch.
          </DialogDescription>
        </DialogHeader>
        
        {submitted ? (
          <div className="py-8 text-center">
            <div className="mb-4 text-5xl">✓</div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
              You&apos;re on the list!
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>
              We&apos;ll be in touch soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userType">I am... *</Label>
              <Select
                required
                value={formData.userType}
                onValueChange={(value) => setFormData({ ...formData, userType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">An individual sending money internationally</SelectItem>
                  <SelectItem value="business">A business making/receiving global payments</SelectItem>
                  <SelectItem value="bank">A bank or financial institution</SelectItem>
                  <SelectItem value="regulator">A regulator or compliance team</SelectItem>
                  <SelectItem value="partner">A trade/liquidity/settlement partner</SelectItem>
                </SelectContent>
              </Select>
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
              Join Waitlist
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
