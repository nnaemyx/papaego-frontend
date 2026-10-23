'use client';

export function MetricsStrip() {
  const metrics = [
    {
      value: '40+',
      label: 'Global Corridors',
      desc: 'High-liquidity international rails',
    },
    {
      value: '< 15m',
      label: 'Median Settlement',
      desc: 'Instant local & RTGS clearing',
    },
    {
      value: '100%',
      label: 'Regulated Rigor',
      desc: 'CAC RC: 9463271 licensed standard',
    },
    {
      value: '0.0%',
      label: 'Hidden Surcharges',
      desc: 'True interbank wholesale rates',
    },
  ];

  return (
    <section className="w-full bg-surface-pure py-10 shadow-sm relative z-20 border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {metrics.map((item, idx) => (
            <div key={idx} className="flex flex-col items-start pl-2">
              <span className="font-headline-lg text-on-surface font-bold tracking-tight font-code-num">
                {item.value}
              </span>
              <span className="font-label-lg text-gold-dark font-semibold mt-1">
                {item.label}
              </span>
              <span className="font-body-sm text-secondary mt-0.5">
                {item.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

