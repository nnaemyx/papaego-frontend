'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LEGAL_LINKS } from '@/lib/constants/legal';

interface LandingFooterProps {
  onContactUs: () => void;
}

export function LandingFooter({ onContactUs }: LandingFooterProps) {
  return (
    <footer className="w-full bg-slate-surface text-surface-pure mt-12 shadow-[0_-1px_12px_rgba(0,0,0,0.06)] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-slate-950 font-headline-sm font-bold shadow-sm">
                P
              </div>
              <span className="font-headline-sm text-surface-pure font-bold tracking-tight text-xl">
                PapaEgo
              </span>
            </div>
            
            <p className="font-body-md text-slate-300 max-w-sm leading-relaxed">
              Pan-African institutional cross-border liquidity and treasury infrastructure. Engineered for export-import conglomerates, institutions, and licensed financial entities demanding execution speed with zero slippage.
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-label-sm font-label-sm bg-slate-800 text-slate-200 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-success-emerald mr-2 animate-pulse"></span>
                Real-Time Multi-Rail Active
              </span>
            </div>
          </div>

          {/* Solutions Column */}
          <div className="flex flex-col gap-3">
            <span className="font-label-md text-label-md uppercase tracking-wider text-primary-fixed font-bold">
              Solutions
            </span>
            <Link href="#currencies" className="font-body-sm text-slate-300 hover:text-surface-pure transition-colors">
              Treasury Settlement
            </Link>
            <Link href="#currencies" className="font-body-sm text-slate-300 hover:text-surface-pure transition-colors">
              African Corridors
            </Link>
            <Link href="#currencies" className="font-body-sm text-slate-300 hover:text-surface-pure transition-colors">
              Institutional Liquidity
            </Link>
            <Link href="#features" className="font-body-sm text-slate-300 hover:text-surface-pure transition-colors">
              API Settlement Rails
            </Link>
          </div>

          {/* Company & Trust Column */}
          <div className="flex flex-col gap-3">
            <span className="font-label-md text-label-md uppercase tracking-wider text-primary-fixed font-bold">
              Company &amp; Trust
            </span>
            <Link href="#features" className="font-body-sm text-slate-300 hover:text-surface-pure transition-colors">
              Why PapaEgo
            </Link>
            <Link href="#how-it-works" className="font-body-sm text-slate-300 hover:text-surface-pure transition-colors">
              Execution Architecture
            </Link>
            <Link href="/agent-network" className="font-body-sm text-slate-300 hover:text-surface-pure transition-colors">
              Become an Agent
            </Link>
            <Link href="#faq" className="font-body-sm text-slate-300 hover:text-surface-pure transition-colors">
              Institutional FAQ
            </Link>
          </div>

          {/* Contact & Treasury */}
          <div className="flex flex-col gap-3">
            <span className="font-label-md text-label-md uppercase tracking-wider text-primary-fixed font-bold">
              Contact &amp; Treasury
            </span>
            <p className="font-body-sm text-slate-300 font-code-num">support@papaego.com</p>
            <p className="font-body-sm text-slate-300 font-code-num">treasury@papaego.com</p>
            <p className="font-body-sm text-slate-300">Victoria Island, Lagos • London EC2</p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onContactUs}
                className="inline-flex items-center gap-1.5 text-xs text-primary-fixed-dim hover:underline font-bold"
              >
                <span>Open Direct Contact Desk</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Disclosures & Legal */}
        <div className="mt-12 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-t border-slate-800 text-slate-400">
          <div className="flex flex-col gap-1 max-w-2xl">
            <p className="font-body-sm text-slate-300">
              © {new Date().getFullYear()} PapaEgo Technologies. All rights reserved.
            </p>
            <p className="font-label-sm text-slate-400">
              Corporate Affairs Commission Registration RC: 9463271. Fully registered non-bank corporate foreign exchange and institutional trade settlement participant.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-label-md">
            <a
              href={LEGAL_LINKS.PRIVACY_POLICY}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-surface-pure transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href={LEGAL_LINKS.TERMS_AND_CONDITIONS}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-surface-pure transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/legal"
              className="hover:text-surface-pure transition-colors"
            >
              AML/CTF Policy
            </a>
            <button
              type="button"
              onClick={onContactUs}
              className="hover:text-surface-pure transition-colors"
            >
              Security Operations
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
