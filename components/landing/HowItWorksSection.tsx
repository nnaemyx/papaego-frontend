'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    step: '01',
    icon: 'badge',
    title: 'Create an Account',
    description:
      'Sign up in minutes. Verify your corporate identity with our streamlined onboarding process to unlock unrestricted trading.',
    check: 'Instant Digital KYC',
  },
  {
    step: '02',
    icon: 'swap_horiz',
    title: 'Initiate a Trade',
    description:
      'Select your currencies, enter the amount you wish to transfer, and instantly lock in a competitive wholesale exchange rate quote.',
    check: 'Zero Slippage Lock',
  },
  {
    step: '03',
    icon: 'account_balance',
    title: 'Secure Funding',
    description:
      'Deposit funds using local or international payment rails directly into heavily guarded, segregated Tier-1 bank accounts.',
    check: 'Segregated Custody',
  },
  {
    step: '04',
    icon: 'done_all',
    title: 'Fast Settlement',
    description:
      'Once funded, your transaction is processed promptly and settled to your beneficiary account via direct local clearing rails.',
    check: 'Automated Dispatch',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-surface-container-low relative border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-muted text-gold-dark font-label-md font-bold uppercase tracking-wider mb-4">
            How PapaEgo Works
          </div>
          <h2 className="font-headline-lg text-on-surface font-bold tracking-tight mb-4">
            A Simple, Transparent Process
          </h2>
          <p className="font-body-lg text-secondary">
            A friction-free four-step framework engineered to seamlessly move your capital across international boundaries.
          </p>
        </div>

        {/* 4-Step Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((item, idx) => (
            <motion.div
              key={item.step}
              className="bg-surface-pure rounded-2xl p-8 shadow-sm relative flex flex-col justify-between hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-headline-lg text-gold-dark font-bold font-code-num">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-gold-muted text-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>
                </div>
                <h3 className="font-headline-sm text-on-surface font-bold mb-3">
                  {item.title}
                </h3>
                <p className="font-body-md text-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-border-subtle/50">
                <span className="inline-flex items-center gap-1.5 font-label-sm text-gold-dark font-semibold">
                  <span className="material-symbols-outlined text-[14px]">check</span> {item.check}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
