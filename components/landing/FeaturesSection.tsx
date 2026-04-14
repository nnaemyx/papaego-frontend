'use client';

import { motion } from 'framer-motion';
import { Globe, ShieldCheck, Zap, HandCoins } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Global Payment Network',
    description: 'Send and receive money globally with our robust, interconnected financial infrastructure tailored for cross-border needs.',
  },
  {
    icon: ShieldCheck,
    title: 'Bank-Grade Security',
    description: 'Your transactions are protected by industry-leading security protocols and rigorous compliance frameworks.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast Processing',
    description: 'Experience rapid settlement speeds ensuring your business keeps moving without unnecessary financial delays.',
  },
  {
    icon: HandCoins,
    title: 'Competitive FX Rates',
    description: 'Access the best market exchange rates with transparent pricing and zero hidden fees on your transactions.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            className="text-sm font-bold tracking-widest uppercase mb-3"
            style={{ color: 'var(--primary-gold)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Why Choose PapaEgo
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6"
            style={{ color: 'var(--primary-dark)', fontFamily: 'var(--font-bricolage-grotesque)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Empowering Modern Finance
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            We build tools that simplify international trade, breaking down borders to accelerate your global business growth.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 + 0.3 }}
            >
              <div 
                className="absolute inset-0 bg-gradient-to-br from-transparent to-[#C9A22710] opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
              />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm" style={{ backgroundColor: 'var(--primary-dark)' }}>
                <feature.icon className="w-6 h-6" style={{ color: 'var(--primary-gold)' }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--primary-dark)' }}>
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
