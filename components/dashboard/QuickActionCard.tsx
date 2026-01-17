import Link from 'next/link';
import Image from 'next/image';
import { QuickAction } from '@/lib/types';

interface QuickActionCardProps {
  action: QuickAction;
}

const gradientStyles = {
  green: {
    background: 'var(--gradient-green)',
    textColor: 'var(--action-green-text)',
  },
  blue: {
    background: 'var(--gradient-blue)',
    textColor: 'var(--action-blue-text)',
  },
  pink: {
    background: 'var(--gradient-pink)',
    textColor: 'var(--action-pink-text)',
  },
  yellow: {
    background: 'var(--gradient-yellow)',
    textColor: 'var(--action-yellow-text)',
  },
};

export function QuickActionCard({ action }: QuickActionCardProps) {
  const styles = gradientStyles[action.gradient];
  
  return (
    <Link href={action.href}>
      <div 
        className="rounded-xl py-4 pr-5 pl-4 shadow-[0px_10px_30px_rgba(206,206,206,0.25),inset_0px_8px_16px_rgba(0,0,0,0.3)] transition-transform hover:scale-[1.02] cursor-pointer h-40.75 flex flex-col"
        style={{ background: styles.background }}
      >
        <div className="flex-1 flex items-start">
          <Image 
            src={action.icon} 
            alt={action.title}
            width={79}
            height={85}
            className="object-contain"
          />
        </div>
        <p 
          className="text-lg font-black mt-3 text-right"
          style={{ color: styles.textColor }}
        >
          {action.title}
        </p>
      </div>
    </Link>
  );
}