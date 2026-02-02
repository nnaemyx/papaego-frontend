import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
  {
    variants: {
      variant: {
        'in-progress': 'bg-blue-100 text-blue-700 border border-blue-200',
        'verified': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        'completed': 'bg-green-100 text-green-700 border border-green-200',
        'pending': 'bg-gray-100 text-gray-700 border border-gray-200',
        'error': 'bg-red-100 text-red-700 border border-red-200',
      },
    },
    defaultVariants: {
      variant: 'pending',
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  icon?: React.ReactNode;
}

export function StatusBadge({ 
  className, 
  variant, 
  icon,
  children, 
  ...props 
}: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ variant }), className)} {...props}>
      {icon}
      {children}
    </span>
  );
}
