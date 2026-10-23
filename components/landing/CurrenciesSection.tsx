'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const corridors = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', rate: 1610.50, min: '$12,418' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', rate: 1740.20, min: '€11,492' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', rate: 2045.80, min: '£9,776' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', rate: 224.10, min: '¥89,245' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', rate: 1180.40, min: 'C$16,943' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', rate: 1060.10, min: 'A$18,866' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', rate: 1820.60, min: 'Fr 10,985' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', rate: 10.85, min: '¥1,843,317' },
  { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', rate: 1, min: '₦20,000,000' },
];

export function CurrenciesSection() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [ngnAmount, setNgnAmount] = useState('20000000');

  const curr = corridors.find((c) => c.code === selectedCurrency) || corridors[0];
  const numNgn = parseFloat(ngnAmount.replace(/[^0-9.]/g, '')) || 0;
  const converted = curr.rate > 0 ? (numNgn / curr.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';

  return (
    <section id="currencies" className="relative overflow-hidden bg-gradient-to-b from-surface-light via-surface-pure to-surface-container-low pb-20 pt-16 lg:pb-28 lg:pt-24 border-t border-border-subtle">
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-primary-container/10 rounded-full blur-[120px]"></div>
      <div className="pointer-events-none absolute top-1/3 -right-20 w-[500px] h-[500px] bg-gold-dark/5 rounded-full blur-[140px]"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-gold-muted border border-gold-dark/20 text-on-surface shadow-sm mb-6">
              <span className="text-sm leading-none">🌍</span>
              <span className="font-label-md text-gold-dark font-semibold tracking-wide">
                Institutional Liquidity Corridors
              </span>
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success-emerald"></span>
              </span>
            </div>

            <h2 className="font-display-xl text-on-surface tracking-tight font-bold mb-6 leading-tight">
              Global Corridors &amp; <span className="text-gold-dark relative inline-block">Real-Time</span> Liquidity
            </h2>

            <p className="font-body-lg text-secondary max-w-2xl mb-8 leading-relaxed">
              Wholesale interbank clearing across Africa, Asia, Europe, and the Americas. Settle multimillion-naira enterprise purchase orders with same-day guaranteed execution.
            </p>

            {/* Supported Active Corridors Pill Grid */}
            <div className="w-full mb-8">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-bold block mb-3">
                Select Corridor To Preview Conversion:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {corridors.filter(c => c.code !== 'NGN').map((c) => {
                  const isSelected = selectedCurrency === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setSelectedCurrency(c.code)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                        isSelected
                          ? 'bg-gold-muted border-gold-dark shadow-sm'
                          : 'bg-surface-light border-border-subtle hover:border-gold-dark/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{c.flag}</span>
                        <span className={`font-label-sm font-bold ${isSelected ? 'text-gold-dark' : 'text-on-surface'}`}>
                          {c.code}
                        </span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-success-emerald"></span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trust Footer Badges */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-4 text-secondary border-t border-border-subtle w-full font-label-md">
              <div className="flex items-center gap-1.5 text-on-surface font-semibold">
                <span className="material-symbols-outlined text-success-emerald text-[18px]">verified</span>
                <span>RC: 9463271 Compliant</span>
              </div>
              <span className="text-border-subtle">•</span>
              <div className="flex items-center gap-1.5 text-on-surface font-semibold">
                <span className="material-symbols-outlined text-success-emerald text-[18px]">account_balance</span>
                <span>Segregated Tier-1 Accounts</span>
              </div>
              <span className="text-border-subtle">•</span>
              <div className="flex items-center gap-1.5 text-on-surface font-semibold">
                <span className="material-symbols-outlined text-success-emerald text-[18px]">bolt</span>
                <span>Sub-15m Settlement</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Telemetry & Interactive Calculator Card */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center">
            <div className="relative w-full rounded-3xl bg-surface-pure border border-border-subtle p-6 sm:p-8 shadow-xl">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-5 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-muted flex items-center justify-center text-gold-dark font-bold">
                    <span className="material-symbols-outlined text-[22px]">payments</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-[18px] text-on-surface font-bold">Global Liquidity Rails</h4>
                    <span className="font-label-sm text-secondary">Wholesale Indicative Calculator</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-surface border border-success-emerald/20 text-success-emerald font-label-sm text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-emerald animate-pulse"></span>
                  Live 99.99%
                </div>
              </div>

              {/* Conversion Calculator Box */}
              <div className="py-5 border-b border-border-subtle space-y-4">
                <div>
                  <div className="flex items-center justify-between text-secondary font-label-sm mb-1.5">
                    <span>You Send (NGN)</span>
                    <span className="text-gold-dark font-semibold">Min: ₦20,000,000</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="20000000"
                      step="1000000"
                      value={ngnAmount}
                      onChange={(e) => setNgnAmount(e.target.value)}
                      className="w-full bg-surface-light border border-border-subtle rounded-xl px-4 py-3 font-code-num font-bold text-on-surface text-lg focus:outline-none focus:border-gold-dark"
                    />
                    <span className="absolute right-3.5 top-3.5 font-label-md font-bold text-secondary">
                      🇳🇬 NGN
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-surface-light border border-border-subtle p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{curr.flag}</span>
                        <span className="font-label-lg font-bold text-on-surface">
                          Recipient Receives ({curr.code})
                        </span>
                      </div>
                      <span className="font-body-sm text-secondary">Interbank Settlement Rate: ~₦{curr.rate.toLocaleString()}/{curr.code}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-headline-sm font-bold text-gold-dark font-code-num block">
                        {converted}
                      </span>
                      <span className="font-label-sm text-[11px] text-secondary font-code-num">Wholesale Execution</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-xs">
                    <span className="font-body-sm text-secondary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-gold-dark">sync_alt</span>
                      NGN to {curr.code} • Providus/Wema/SWIFT
                    </span>
                    <span className="inline-flex items-center gap-1 font-label-sm text-[11px] font-semibold text-success-emerald bg-success-surface px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      Median &lt; 15 mins
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Verified Settlement Reference */}
              <div className="py-4">
                <div className="flex items-center justify-between text-secondary font-label-sm mb-2">
                  <span>Recent Settlement Telemetry</span>
                  <span className="text-gold-dark font-code-num font-semibold">Ref: TR-8942-LON</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-light border border-border-subtle">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">🇬🇧</span>
                    <div>
                      <p className="font-label-sm font-bold text-on-surface">Apex Logistics Ltd</p>
                      <p className="text-[10px] text-secondary">London, United Kingdom</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-label-sm font-bold text-on-surface font-code-num">£42,500.00</span>
                    <span className="block text-[10px] text-success-emerald font-semibold">✓ Settled in 8 mins</span>
                  </div>
                </div>
              </div>

              {/* Bottom Guarantee */}
              <div className="mt-2 pt-4 border-t border-border-subtle flex items-center justify-between text-secondary font-label-sm text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-gold-dark">security</span>
                  <span>Bank-Grade Infrastructure</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-success-emerald">check</span>
                  <span>Zero Spread Markup</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
