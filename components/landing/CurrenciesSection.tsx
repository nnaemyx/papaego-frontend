'use client';

import { motion } from 'framer-motion';
import { Globe2, TrendingUp, ShieldCheck } from 'lucide-react';

const currencies = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '€' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', symbol: 'Fr' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', symbol: '¥' },
  { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', symbol: '₦' },
];

const highlights = [
  {
    icon: Globe2,
    title: '40+ Countries',
    description: 'Send and receive payments to over 40 countries worldwide through our growing global network.',
  },
  {
    icon: TrendingUp,
    title: 'Transparent FX Rates',
    description: 'Access live, competitive exchange rates with no hidden markups — what you see is what you pay.',
  },
  {
    icon: ShieldCheck,
    title: 'Regulated Infrastructure',
    description: 'Every transaction flows through compliant, bank-grade rails built for trust and accountability.',
  },
];

export function CurrenciesSection() {
  return (
    <section id="currencies" className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--dark-bg)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            className="text-sm font-bold tracking-widest uppercase mb-3"
            style={{ color: 'var(--primary-gold)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Supported Currencies
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 text-white"
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Send Money in Major World Currencies
          </motion.h2>
          <motion.p
            className="text-gray-400 text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Starting with Nigeria 🇳🇬 — send, receive, and settle in USD, EUR, GBP and more,
            with more African countries joining soon.
          </motion.p>
        </div>

        {/* Currency Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {currencies.map((currency, idx) => (
            <motion.div
              key={currency.code}
              className="relative rounded-2xl p-5 flex flex-col gap-2 group overflow-hidden"
              style={{
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.07 }}
              whileHover={{ scale: 1.03, borderColor: 'var(--primary-gold)' }}
            >
              {/* Highlight for NGN */}
              {currency.code === 'NGN' && (
                <span
                  className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--primary-gold)', color: 'white' }}
                >
                  Launch
                </span>
              )}
              <span className="text-3xl">{currency.flag}</span>
              <div>
                <p
                  className="text-xl font-black"
                  style={{ color: 'var(--primary-gold)', fontFamily: 'var(--font-bricolage-grotesque)' }}
                >
                  {currency.code}
                </p>
                <p className="text-sm text-gray-400">{currency.name}</p>
              </div>
              <p className="text-2xl font-bold text-gray-500">{currency.symbol}</p>
            </motion.div>
          ))}
        </div>

        {/* More countries badge */}
        <motion.div
          className="flex justify-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <span
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold"
            style={{
              backgroundColor: '#2a2a2a',
              color: 'var(--primary-gold)',
              border: '1px dashed var(--primary-gold)',
              fontFamily: 'var(--font-bricolage-grotesque)',
            }}
          >
            + More currencies across 40+ countries coming soon
          </span>
        </motion.div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((item, idx) => (
            <motion.div
              key={item.title}
              className="flex flex-col gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 + 0.3 }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--primary-gold)' }}
              >
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3
                className="text-xl font-bold text-white"
                style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                {item.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
