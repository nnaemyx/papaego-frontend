'use client';

import { motion } from 'framer-motion';

const features = [
  {
    icon: 'public',
    title: 'Global Payment Network',
    description:
      'Institutional-grade payment channels spanning 40+ countries. Engineered specifically for African enterprises, exporters, and multinational trading partners to route capital globally with zero friction.',
    cta: 'Explore network rails',
  },
  {
    icon: 'verified_user',
    title: 'Bank-Grade Security',
    description:
      'Enterprise-grade 256-bit data encryption, multi-tier access controls, and strict compliance monitoring under CAC RC: 9463271. All client funds are protected in ring-fenced, segregated Tier-1 banking accounts.',
    cta: 'Security audit reports',
  },
  {
    icon: 'speed',
    title: 'Fast Settlement',
    description:
      'Rapid clearing via direct RTGS, SWIFT GPI, and local switch integrations delivering sub-15 minute median settlement execution and automated dispatch.',
    cta: 'View clearing speed',
  },
  {
    icon: 'percent',
    title: 'Competitive FX Rates',
    description:
      'Real-time wholesale interbank quotes for USD, EUR, GBP, NGN, CAD, AUD, CHF, and JPY with 0.0% hidden surcharges, guaranteed rate locks, and total spread transparency.',
    cta: 'Wholesale rate guide',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-surface-container-low relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-muted text-gold-dark font-label-md font-bold uppercase tracking-wider mb-4">
            Why Choose PapaEgo
          </div>
          <h2 className="font-headline-lg text-on-surface font-bold tracking-tight mb-4">
            Empowering Modern Finance
          </h2>
          <p className="font-body-lg text-secondary">
            We build tools that simplify international trade, breaking down borders to accelerate your global business growth.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((card, idx) => (
            <motion.div
              key={card.title}
              className="bg-surface-pure rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <div>
                <div className="w-14 h-14 rounded-xl bg-gold-muted flex items-center justify-center text-primary-container mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">{card.icon}</span>
                </div>
                <h3 className="font-headline-sm text-on-surface font-bold mb-3">
                  {card.title}
                </h3>
                <p className="font-body-md text-secondary leading-relaxed">
                  {card.description}
                </p>
              </div>
              <div className="mt-8 pt-4 flex items-center text-gold-dark font-label-md font-bold group-hover:translate-x-1 transition-transform">
                <span>{card.cta}</span>
                <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
