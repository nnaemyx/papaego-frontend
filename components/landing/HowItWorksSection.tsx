'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Create an Account',
    description:
      'Sign up in minutes. Verify your identity with our streamlined onboarding process to unlock unrestricted trading.',
  },
  {
    number: '02',
    title: 'Initiate a Trade',
    description:
      'Select your currencies, enter the amount you wish to transfer, and instantly receive a competitive exchange rate quote.',
  },
  {
    number: '03',
    title: 'Secure Funding',
    description:
      'Deposit funds using local or international payment methods into our heavily secured, segregated bank accounts.',
  },
  {
    number: '04',
    title: 'Fast Settlement',
    description:
      'Once funded, your transaction is processed promptly and settled to your beneficiary account via our banking rails.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            className="text-3xl md:text-5xl font-extrabold mb-6"
            style={{ color: 'var(--primary-dark)', fontFamily: 'var(--font-bricolage-grotesque)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            How PapaEgo Works
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            A simple, transparent four-step process to move your money across borders.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-[2px] bg-gray-200 -z-10" />

          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              className="relative flex flex-col items-center text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
            >
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black mb-8 border-8 border-gray-50 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: 'var(--primary-dark)', color: 'var(--primary-gold)' }}
              >
                {step.number}
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary-dark)' }}>
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed max-w-[280px]">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
