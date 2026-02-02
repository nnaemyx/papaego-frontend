import React from 'react';
import { cn } from '@/lib/utils';

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  valueClassName?: string;
}

export function DetailRow({ label, value, className, valueClassName }: DetailRowProps) {
  return (
    <div className={cn('flex justify-between items-start py-2', className)}>
      <span className="text-sm text-(--text-secondary)">{label}</span>
      <span className={cn('text-sm font-medium text-(--text-primary) text-right', valueClassName)}>
        {value}
      </span>
    </div>
  );
}
