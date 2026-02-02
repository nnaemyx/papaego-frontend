import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoAlertProps {
  children: React.ReactNode;
  className?: string;
}

export function InfoAlert({ children, className }: InfoAlertProps) {
  return (
    <div className={cn('info-box-bg rounded-lg p-3 flex items-start gap-2', className)}>
      <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-blue-900">{children}</p>
    </div>
  );
}
