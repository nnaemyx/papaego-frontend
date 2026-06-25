'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ContactUsSheet } from '@/components/landing/ContactUsSheet';
import { AgentApplicationForm } from '@/components/agent-network/AgentApplicationForm';
import {
  DollarSign, Clock, BookOpen, Globe, TrendingUp,
  ChevronDown, CheckCircle2, ArrowRight, Shield, Zap, BarChart3,
} from 'lucide-react';

// ── Data ─────────────────────────────────────────────────────────────────────

const WHY_BENEFITS = [
  {
    icon: DollarSign,
    title: 'Attractive Commissions',
    desc: 'Earn rewards for every successful customer and transaction you bring to the platform.',
  },
  {
    icon: Clock,
    title: 'Flexible Work',
    desc: 'Operate from anywhere and manage your activities on your own schedule.',
  },
  {
    icon: BookOpen,
    title: 'Training & Support',
    desc: 'Receive onboarding, educational resources, and continuous support from our team.',
  },
  {
    icon: Globe,
    title: 'Be Part of Something Bigger',
    desc: 'Join an ambitious fintech company focused on making global payments easier and more accessible.',
  },
  {
    icon: TrendingUp,
    title: 'Growth Opportunities',
    desc: 'Grow alongside the PapaEgo ecosystem as we expand across Africa and beyond.',
  },
];

const WHO_CAN = [
  'Business owners and entrepreneurs.',
  'Sales and marketing professionals.',
  'Freelancers and consultants.',
  'Community leaders and network builders.',
  'Students and graduates.',
  'Individuals passionate about fintech and financial inclusion.',
];

const WHAT_YOULL_DO = [
  'Introduce individuals and businesses to PapaEgo.',
  'Educate customers about our cross-border payment solutions.',
  'Help customers begin their onboarding journey.',
  'Build relationships within your community and network.',
  'Earn commissions and incentives as your customer base grows.',
];

const STEPS = [
  { step: '01', title: 'Submit your application.', desc: 'Fill out the short form below with your details.' },
  { step: '02', title: 'Our team reviews your information.', desc: 'We carefully evaluate every submission.' },
  { step: '03', title: 'Onboarding and training.', desc: 'Successful applicants receive support to get started.' },
  { step: '04', title: 'Start earning commissions.', desc: 'Refer customers and watch your income grow.' },
];

const WHY_PAPAEGO = [
  {
    icon: Globe,
    title: 'Borderless Payments',
    desc: 'Enable customers to transact globally with ease.',
  },
  {
    icon: Shield,
    title: 'Trusted Platform',
    desc: 'Built with security, transparency, and compliance at its core.',
  },
  {
    icon: BarChart3,
    title: 'Treasury Intelligence System (TIS)',
    desc: 'Helping businesses gain greater visibility and control over their finances.',
  },
  {
    icon: Zap,
    title: 'Growing Ecosystem',
    desc: 'Join early and grow with a platform designed for long-term impact.',
  },
];

const FAQS = [
  { q: 'Is there a registration fee?', a: 'No. Becoming a PapaEgo Agent is completely free.' },
  { q: 'Will training be provided?', a: 'Yes. Successful applicants will receive onboarding and continuous support.' },
  { q: 'Can I work remotely?', a: 'Absolutely. Agents can operate from any location.' },
  { q: 'Do I need experience in finance?', a: 'No. We provide the resources and guidance needed to help you succeed.' },
  { q: 'When will I hear back?', a: 'Shortlisted applicants will be contacted after the review process.' },
];

// ── Animation Variants ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' as const },
  }),
};


// ── Components ────────────────────────────────────────────────────────────────

function SectionWrapper({ id, children, bg = 'white' }: { id?: string; children: React.ReactNode; bg?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section id={id} ref={ref} style={{ backgroundColor: bg }} className="py-20 px-4">
      <motion.div
        className="max-w-6xl mx-auto"
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {children}
      </motion.div>
    </section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border rounded-xl overflow-hidden transition-all"
      style={{ borderColor: open ? 'var(--brand-primary)' : 'var(--border-custom)' }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
        style={{ backgroundColor: open ? '#fef9ec' : '#fff' }}
      >
        <span
          className="text-base font-semibold"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          {q}
        </span>
        <ChevronDown
          className="flex-shrink-0 w-5 h-5 transition-transform duration-300"
          style={{
            color: 'var(--brand-primary)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      {open && (
        <div
          className="px-6 pb-5 text-sm leading-relaxed"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AgentNetworkPage() {
  const [contactOpen, setContactOpen] = useState(false);

  const scrollToForm = () => {
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--light-bg)' }}>
      <LandingHeader onContactUs={() => setContactOpen(true)} />

      <main>
        {/* ── HERO: Split — text left, image right ─────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{ backgroundColor: 'var(--dark-blue)', minHeight: '100vh' }}
        >
          {/* Subtle radial gold glow on bottom-left */}
          <div
            className="absolute bottom-0 left-0 w-[600px] h-[400px] pointer-events-none z-0"
            style={{
              background: 'radial-gradient(ellipse at bottom left, rgba(201,162,39,0.1) 0%, transparent 70%)',
            }}
          />
          {/* Top-right gentle glow where image meets dark bg */}
          <div
            className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none z-0"
            style={{
              background: 'radial-gradient(ellipse at top right, rgba(201,162,39,0.06) 0%, transparent 70%)',
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen items-center gap-0">

              {/* ── LEFT: Text content ────────────────────────────────── */}
              <div className="flex flex-col py-32 lg:py-0 pr-0 lg:pr-16">

                {/* Pill */}
                <motion.div
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 self-start"
                  style={{ backgroundColor: 'rgba(201,162,39,0.16)', border: '1px solid rgba(201,162,39,0.4)' }}
                >
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--brand-primary)' }} />
                  <span
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: 'var(--brand-primary)', fontFamily: 'var(--font-bricolage-grotesque)' }}
                  >
                    Agent Network
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  className="landing-hero-title mb-6"
                  style={{ color: '#fff', lineHeight: 1.06 }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                >
                  Become a{' '}
                  <span style={{ color: 'var(--brand-primary)' }}>PapaEgo</span>
                  <br />Agent.
                </motion.h1>

                {/* Sub-copy */}
                <motion.p
                  className="text-lg mb-10 leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.68)', fontFamily: 'var(--font-bricolage-grotesque)', maxWidth: '440px' }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  Earn More. Grow Your Network. Power Global Payments.
                  Join the growing PapaEgo agent network and help businesses and individuals access
                  seamless cross-border payment solutions while building a sustainable source of income.
                </motion.p>

                {/* Trust badges — 2-col micro grid */}
                <motion.div
                  className="grid grid-cols-2 gap-3 mb-10"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                >
                  {[
                    { icon: DollarSign, label: 'Attractive Commissions' },
                    { icon: Clock,      label: 'Flexible Work' },
                    { icon: BookOpen,   label: 'Full Training & Support' },
                    { icon: TrendingUp, label: 'Growth Opportunities' },
                  ].map((b) => {
                    const Icon = b.icon;
                    return (
                      <div
                        key={b.label}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.09)',
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: 'rgba(201,162,39,0.2)' }}
                        >
                          <Icon className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
                        </div>
                        <span
                          className="text-xs font-semibold leading-tight"
                          style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-bricolage-grotesque)' }}
                        >
                          {b.label}
                        </span>
                      </div>
                    );
                  })}
                </motion.div>

                {/* CTA buttons */}
                <motion.div
                  className="flex flex-wrap items-center gap-4"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.45 }}
                >
                  <button
                    id="hero-apply-now"
                    onClick={scrollToForm}
                    className="group inline-flex items-center gap-3 px-7 py-4 rounded-xl font-bold text-base transition-all hover:scale-105 hover:shadow-2xl"
                    style={{
                      backgroundColor: 'var(--brand-primary)',
                      color: '#fff',
                      fontFamily: 'var(--font-bricolage-grotesque)',
                    }}
                  >
                    Apply Now
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
                    <span
                      className="text-sm"
                      style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-bricolage-grotesque)' }}
                    >
                      Free to join. No fees.
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* ── RIGHT: Hero image panel ────────────────────────────── */}
              <motion.div
                className="hidden lg:flex items-center justify-end h-full py-24"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.15 }}
              >
                <div
                  className="relative w-full rounded-3xl overflow-hidden"
                  style={{
                    maxHeight: '75vh',
                    aspectRatio: '16/11',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,162,39,0.25)',
                  }}
                >
                  <Image
                    src="/images/agent-hero.jpg"
                    alt="PapaEgo global trading hub"
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Subtle left-edge fade so it blends into the dark section */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, rgba(1,35,51,0.45) 0%, transparent 30%, transparent 70%, rgba(1,35,51,0.2) 100%)',
                    }}
                  />
                  {/* Gold corner accent */}
                  <div
                    className="absolute top-0 right-0 w-24 h-1"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                  />
                  <div
                    className="absolute top-0 right-0 w-1 h-24"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                  />
                </div>
              </motion.div>

            </div>
          </div>

          {/* Wave transition to next section */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: '64px', lineHeight: 0 }}>
            <svg viewBox="0 0 1440 64" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
              <path d="M0,64 C480,0 960,48 1440,16 L1440,64 Z" fill="var(--light-bg)" />
            </svg>
          </div>
        </section>

        {/* ── WHY BECOME AN AGENT ───────────────────────────────────────────── */}
        <SectionWrapper id="why" bg="var(--light-bg)">
          <motion.p
            variants={fadeUp}
            custom={0}
            className="landing-eyebrow text-center mb-3"
            style={{ color: 'var(--brand-primary)' }}
          >
            Benefits
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="landing-section-title text-center mb-4"
            style={{ color: 'var(--dark-blue)' }}
          >
            Why Become a PapaEgo Agent?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="landing-body text-center mb-14 max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            At PapaEgo, we're building the future of international payments and treasury management
            for Africans and businesses that operate globally. As an agent, you'll enjoy:
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {WHY_BENEFITS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  custom={i + 3}
                  className="flex flex-col items-start gap-4 p-6 rounded-2xl transition-all hover:shadow-lg hover:-translate-y-1"
                  style={{ backgroundColor: '#fff', border: '1.5px solid var(--border-light)' }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: '#fef9ec' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                  </div>
                  <div>
                    <h3
                      className="text-base font-bold mb-1"
                      style={{ color: 'var(--dark-blue)', fontFamily: 'var(--font-bricolage-grotesque)' }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-bricolage-grotesque)' }}>
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </SectionWrapper>

        {/* ── WHO CAN + WHAT YOULL DO ───────────────────────────────────────── */}
        <SectionWrapper bg="var(--dark-blue)">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
            {/* Who Can */}
            <div>
              <motion.p
                variants={fadeUp}
                custom={0}
                className="landing-eyebrow mb-3"
                style={{ color: 'var(--brand-primary)' }}
              >
                Who Can Apply
              </motion.p>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="landing-section-title mb-6 text-white"
              >
                Who Can Become a PapaEgo Agent?
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="landing-body mb-8"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                We're looking for motivated individuals who care about financial access:
              </motion.p>
              <div className="space-y-3">
                {WHO_CAN.map((item, i) => (
                  <motion.div
                    key={item}
                    variants={fadeUp}
                    custom={i + 3}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--brand-primary)' }} />
                    <span className="text-base" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-bricolage-grotesque)' }}>
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
              <motion.p
                variants={fadeUp}
                custom={10}
                className="mt-8 text-sm font-semibold"
                style={{ color: 'var(--brand-primary)', fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                ✦ No prior experience in finance is required.
              </motion.p>
            </div>

            {/* What You'll Do */}
            <div>
              <motion.p
                variants={fadeUp}
                custom={0}
                className="landing-eyebrow mb-3"
                style={{ color: 'var(--brand-primary)' }}
              >
                Your Role
              </motion.p>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="landing-section-title mb-6 text-white"
              >
                What Will You Do?
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="landing-body mb-8"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                As a PapaEgo Agent, your day-to-day activities will include:
              </motion.p>
              <div className="space-y-4">
                {WHAT_YOULL_DO.map((item, i) => (
                  <motion.div
                    key={item}
                    variants={fadeUp}
                    custom={i + 3}
                    className="flex items-start gap-4 p-4 rounded-xl"
                    style={{ backgroundColor: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.2)' }}
                  >
                    <span
                      className="text-sm font-bold flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-bricolage-grotesque)' }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-bricolage-grotesque)' }}>
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <SectionWrapper id="how-it-works" bg="var(--light-bg)">
          <motion.p
            variants={fadeUp}
            custom={0}
            className="landing-eyebrow text-center mb-3"
            style={{ color: 'var(--brand-primary)' }}
          >
            Process
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="landing-section-title text-center mb-4"
            style={{ color: 'var(--dark-blue)' }}
          >
            How It Works
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="landing-body text-center mb-14 max-w-xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Our straightforward onboarding process gets you up and earning in 4 easy steps.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div
              className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5"
              style={{ backgroundColor: 'var(--border-custom)' }}
            />

            {STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                custom={i + 3}
                className="relative flex flex-col items-center text-center gap-4 p-6 rounded-2xl"
                style={{ backgroundColor: '#fff', border: '1.5px solid var(--border-light)' }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-black z-10"
                  style={{
                    backgroundColor: i === 0 ? 'var(--brand-primary)' : '#fef9ec',
                    color: i === 0 ? '#fff' : 'var(--brand-primary)',
                    fontFamily: 'var(--font-bricolage-grotesque)',
                    border: '2px solid var(--brand-primary)',
                  }}
                >
                  {step.step}
                </div>
                <div>
                  <h3
                    className="text-base font-bold mb-1"
                    style={{ color: 'var(--dark-blue)', fontFamily: 'var(--font-bricolage-grotesque)' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-bricolage-grotesque)' }}>
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>

        {/* ── WHY PAPAEGO ──────────────────────────────────────────────────── */}
        <SectionWrapper bg="white">
          <motion.p
            variants={fadeUp}
            custom={0}
            className="landing-eyebrow text-center mb-3"
            style={{ color: 'var(--brand-primary)' }}
          >
            Platform
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="landing-section-title text-center mb-14"
            style={{ color: 'var(--dark-blue)' }}
          >
            Why PapaEgo?
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_PAPAEGO.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  custom={i + 2}
                  className="flex flex-col gap-4 p-6 rounded-2xl transition-all hover:shadow-lg hover:-translate-y-1"
                  style={{
                    background: i % 2 === 0
                      ? 'linear-gradient(135deg, #012333 0%, #023147 100%)'
                      : 'linear-gradient(135deg, #c9a227 0%, #e6b830 100%)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3
                      className="text-base font-bold mb-2 text-white"
                      style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-bricolage-grotesque)' }}>
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </SectionWrapper>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <SectionWrapper id="faq" bg="var(--light-bg)">
          <motion.p
            variants={fadeUp}
            custom={0}
            className="landing-eyebrow text-center mb-3"
            style={{ color: 'var(--brand-primary)' }}
          >
            FAQ
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="landing-section-title text-center mb-14"
            style={{ color: 'var(--dark-blue)' }}
          >
            Frequently Asked Questions
          </motion.h2>

          <motion.div variants={fadeUp} custom={2} className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </motion.div>
        </SectionWrapper>

        {/* ── READY TO JOIN + FORM ─────────────────────────────────────────── */}
        <section id="apply" className="py-20 px-4" style={{ backgroundColor: 'white' }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

              {/* Left CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
                className="lg:sticky lg:top-32"
              >
                <p className="landing-eyebrow mb-4" style={{ color: 'var(--brand-primary)' }}>Apply</p>
                <h2 className="landing-section-title mb-6" style={{ color: 'var(--dark-blue)' }}>
                  Ready to Join Us?
                </h2>
                <p className="landing-body mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Become part of a movement that's simplifying cross-border payments and empowering
                  businesses across Africa. Complete the form and our team will be in touch.
                </p>

                <div className="space-y-3">
                  {[
                    { icon: Shield,     text: 'Free to join. No registration fees.' },
                    { icon: BookOpen,   text: 'Full onboarding & training provided.' },
                    { icon: Globe,      text: 'Work from anywhere, anytime.' },
                    { icon: DollarSign, text: 'Earn commission on every referral.' },
                  ].map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <div key={badge.text} className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#fef9ec' }}
                        >
                          <Icon className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
                        </div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bricolage-grotesque)' }}
                        >
                          {badge.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-10 text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-bricolage-grotesque)' }}>
                  PapaEgo — Borderless Payments. Smarter Treasury. Global Possibilities.
                </p>
              </motion.div>

              {/* Right: Application Form — NO animation so it's always visible */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="rounded-2xl p-8"
                style={{ backgroundColor: '#f7f8f9', border: '1.5px solid var(--border-light)' }}
              >
                <h3
                  className="text-xl font-bold mb-6"
                  style={{ color: 'var(--dark-blue)', fontFamily: 'var(--font-bricolage-grotesque)' }}
                >
                  Agent Application
                </h3>
                <AgentApplicationForm />
              </motion.div>

            </div>
          </div>
        </section>

      </main>

      <LandingFooter onContactUs={() => setContactOpen(true)} />
      <ContactUsSheet open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
}
