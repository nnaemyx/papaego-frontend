'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: 'Which countries do you currently support?',
    answer:
      'PapaEgo currently enables transfers across 40+ countries globally, starting with direct clearing infrastructure in Nigeria and expanding pan-African clearing networks across China, the United Kingdom, European Union, United States, Canada, Australia, Switzerland, and Asia.',
  },
  {
    question: 'Which currencies can I send and receive?',
    answer:
      'We support major global currencies including USD (US Dollar), EUR (Euro), GBP (British Pound), CNY (Chinese Yuan), CAD (Canadian Dollar), AUD (Australian Dollar), CHF (Swiss Franc), JPY (Japanese Yen), and NGN (Nigerian Naira).',
  },
  {
    question: 'Is PapaEgo regulated and compliant?',
    answer:
      'Yes. PapaEgo is a registered corporate entity in Nigeria (RC Number: 9463271) adhering strictly to AML/CFT statutory compliance frameworks, regulatory oversight, and Tier-1 banking custody standards.',
  },
  {
    question: 'How long does a transfer take?',
    answer:
      'Transfers through local clearing rails and major regional automated switches achieve a median settlement speed of under 15 minutes. International SWIFT or RTGS wires settle within same-day business windows.',
  },
  {
    question: 'What are the fees and minimum transaction limits for sending money?',
    answer:
      'PapaEgo operates on true interbank wholesale FX pricing with 0.0% hidden fees or spread markups. To serve institutional and trade import-export volumes efficiently, our minimum transaction threshold is ₦20,000,000 (Twenty Million Naira). All exchange rates and transfer costs are displayed transparently before transaction confirmation.',
  },
  {
    question: 'How do I get started?',
    answer:
      "Click 'Register Business', submit your business registration and KYC documents for rapid verification by our Lagos compliance desk, and begin trading immediately.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 bg-surface-pure relative border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Verification & Support Card */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-muted text-gold-dark font-label-md font-bold uppercase tracking-wider mb-4">
                Got Questions?
              </div>
              <h2 className="font-headline-lg text-on-surface font-bold tracking-tight mb-4">
                Frequently Asked Questions
              </h2>
              <p className="font-body-lg text-secondary mb-8">
                Everything you need to know about the PapaEgo institutional execution network. Can&apos;t find your answer? Reach our dedicated treasury desk.
              </p>
            </div>

            {/* Institutional Trust Box */}
            <div className="bg-surface-light rounded-2xl p-8 shadow-sm flex flex-col gap-6 border border-border-subtle">
              <h4 className="font-headline-sm text-on-surface font-bold">
                Corporate Verification &amp; Desk
              </h4>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold-muted text-primary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">business</span>
                </div>
                <div>
                  <span className="font-label-sm text-secondary uppercase font-bold tracking-wider block">
                    Company Registration
                  </span>
                  <p className="font-code-num font-bold text-on-surface">RC Number: 9463271</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold-muted text-primary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <div>
                  <span className="font-label-sm text-secondary uppercase font-bold tracking-wider block">
                    Support Email
                  </span>
                  <p className="font-code-num font-bold text-on-surface">support@papaego.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold-muted text-primary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                </div>
                <div>
                  <span className="font-label-sm text-secondary uppercase font-bold tracking-wider block">
                    Address
                  </span>
                  <p className="font-body-md font-semibold text-on-surface">Lagos, Nigeria</p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  className="inline-flex items-center gap-2 text-gold-dark font-label-md font-bold hover:underline"
                  href="mailto:support@papaego.com"
                >
                  <span>Reach Treasury Specialists</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive FAQ Accordions */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-surface-light rounded-2xl overflow-hidden shadow-sm border border-border-subtle transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="w-full text-left p-6 font-headline-sm text-on-surface font-semibold flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    <span
                      className={`material-symbols-outlined text-primary-container transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-secondary font-body-md leading-relaxed border-t border-border-subtle/50 pt-3">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
