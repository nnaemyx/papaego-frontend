'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Which countries do you currently support?',
    answer:
      'PapaEgo is launching in Nigeria first. We are actively expanding to other African countries and will announce new market additions as they become available. Our goal is to cover all major African markets.',
  },
  {
    question: 'Which currencies can I send and receive?',
    answer:
      'We support major international currencies including USD (US Dollar), EUR (Euro), and GBP (British Pound), with more currencies being added. Payments originating from Nigeria can be sent globally and received locally in Naira (NGN) or the sender\'s chosen currency.',
  },
  {
    question: 'Is PapaEgo regulated?',
    answer:
      'Yes. PapaEgo is building its infrastructure on a compliant, regulated framework. We are committed to full regulatory compliance and are working to obtain the necessary licences, including from the Central Bank of Nigeria (CBN). Updates on our regulatory status will be shared on this page.',
  },
  {
    question: 'How long does a transfer take?',
    answer:
      'Settlement times depend on the destination country, currency pair, and banking rails used. We aim for fast, same-day or next-business-day settlement in most corridors. You will always be shown an estimated settlement window before confirming your transaction.',
  },
  {
    question: 'What are the fees for sending money?',
    answer:
      'PapaEgo charges transparent, flat fees with no hidden markups on exchange rates. Our full fee schedule is available once you sign up. We believe in honest, upfront pricing.',
  },
  {
    question: 'How do I get started?',
    answer:
      'Simply click "Create Account", complete our quick KYC onboarding, and you can start sending money internationally within minutes. If you need assistance, reach out to our support team at support@papaego.com.',
  },
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="border rounded-2xl overflow-hidden"
      style={{ borderColor: 'var(--border-custom)' }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span
          className="text-base font-bold pr-4"
          style={{ color: 'var(--text-gray)', fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5" style={{ color: 'var(--primary-gold)' }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p
              className="px-6 pb-5 text-gray-600 leading-relaxed"
              style={{ fontFamily: 'var(--font-bricolage-grotesque)', fontSize: '15px' }}
            >
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            className="text-sm font-bold tracking-widest uppercase mb-3"
            style={{ color: 'var(--primary-gold)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Got Questions?
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4"
            style={{ color: '#212121', fontFamily: 'var(--font-bricolage-grotesque)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            className="text-gray-500 text-base"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Everything you need to know about PapaEgo. Can&apos;t find your answer?{' '}
            <a
              href="mailto:support@papaego.com"
              className="font-semibold hover:underline"
              style={{ color: 'var(--primary-gold)' }}
            >
              Email us
            </a>
            .
          </motion.p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} question={faq.question} answer={faq.answer} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
