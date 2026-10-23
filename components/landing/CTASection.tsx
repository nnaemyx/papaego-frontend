'use client';

import Link from 'next/link';

interface CTASectionProps {
  onContactUs: () => void;
}

export function CTASection({ onContactUs }: CTASectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full">
      <div className="relative rounded-3xl bg-slate-surface text-surface-pure overflow-hidden p-10 sm:p-16 lg:p-20 shadow-2xl border border-slate-800">
        {/* Glow ambient background */}
        <div className="pointer-events-none absolute -right-20 -bottom-20 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl"></div>
        <div className="pointer-events-none absolute top-0 left-0 w-80 h-80 bg-gold-dark/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-border-dark text-primary-fixed font-label-md font-bold uppercase tracking-wider mb-6">
            Powering Africa&apos;s Global Payments
          </div>

          <h2 className="font-display-xl font-bold tracking-tight text-surface-pure mb-6">
            Ready to simplify your global trade?
          </h2>

          <p className="font-body-lg text-slate-300 mb-10 max-w-2xl leading-relaxed">
            Join hundreds of cross-border enterprises moving millions securely each month. Experience institutional FX rails with zero slippage and instantaneous execution.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href="/customer-auth/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gold-dark hover:bg-primary-container text-on-surface font-label-lg font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <span>Register Business Now</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>

            <button
              type="button"
              onClick={onContactUs}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-border-dark hover:bg-slate-800 text-surface-pure font-label-lg font-semibold shadow-sm transition-all border border-slate-700"
            >
              <span className="material-symbols-outlined text-[18px] text-primary-container">mail</span>
              <span>Contact Treasury Desk</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

