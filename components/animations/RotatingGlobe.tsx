'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface RotatingGlobeProps {
  src: string;
  alt: string;
  className?: string;
}

export function RotatingGlobe({ src, alt, className = '' }: RotatingGlobeProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 60,
        ease: 'linear',
        repeat: Infinity,
      }}
      className={className}
    >
      <Image
        src={src}
        alt={alt}
        width={800}
        height={800}
        className="w-full h-auto"
        priority
      />
    </motion.div>
  );
}
