'use client';

import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import DotIndicator from './icons/dot-indicator.svg';

export function ApproachSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const approaches = [
    {
      color: 'var(--accent-blue)',
      title: 'Compliance First',
      description: 'Regulatory alignment, transparency, and auditability are being embedded from the ground up',
    },
    {
      color: 'var(--accent-red)',
      title: 'Multi-Use by Design',
      description: 'The infrastructure is being designed to support personal transfers, business payments, and cross-border trade — not limited to a single use case',
    },
    {
      color: 'var(--accent-green)',
      title: 'Bank-Grade Settlement',
      description: 'Settlement flows are being structured to integrate with global banking systems reliably and securely',
    },
  ];

  return (
    <section 
      ref={ref}
      className="relative py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: 'white' }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center space-y-4 mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p
            className="landing-eyebrow"
            style={{ color: 'var(--primary-gold)' }}
          >
            Our Approach
          </p>
          
          <h2
            className="landing-section-title"
            style={{ color: 'black' }}
          >
            How We&apos;re Approaching Payments Infrastructure
          </h2>
          
          <p className="landing-body max-w-3xl mx-auto" style={{ color: 'var(--text-gray)' }}>
            We&apos;re taking a practical, compliance-led approach to building payment infrastructure that works for real-world use cases.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card 
            className="p-6 lg:p-12 rounded-2xl"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {approaches.map((approach, index) => (
                <div key={index} className="relative">
                  <motion.div
                    className="flex flex-col gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.15 }}
                  >
                    <div className="flex items-start gap-2">
                      <DotIndicator 
                        width={10}
                        height={10}
                        style={{ color: approach.color }}
                        className="mt-2 flex-shrink-0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 
                        className="landing-card-title"
                        style={{ color: 'var(--text-gray)' }}
                      >
                        {approach.title}
                      </h3>
                      <p 
                        className="landing-body"
                        style={{ color: 'var(--text-gray)' }}
                      >
                        {approach.description}
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
