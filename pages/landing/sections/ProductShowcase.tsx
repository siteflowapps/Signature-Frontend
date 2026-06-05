import React from 'react';

const SHOWCASES = [
  {
    title: 'Track Every Outlet in Real-Time',
    desc: 'Daily tracking, geo-tagging, and visibility compliance monitoring across thousands of outlets. Get instant insights into outlet health, activation status, and compliance state.',
    features: ['Geo-tagged daily visits', 'Compliance monitoring', 'Real-time status updates', 'Photo-verified audits'],
    mockData: { stats: [{ l: 'Active', v: '12,847' }, { l: 'Pending', v: '2,401' }, { l: 'Compliance', v: '94.2%' }] },
  },
  {
    title: 'Run Campaigns That Drive Market Share',
    desc: 'Execute Operation Blue, PFP programs, and custom campaigns with real-time execution tracking. Monitor campaign KPIs and field team performance in one view.',
    features: ['Multi-campaign management', 'Execution scorecards', 'Territory-level analytics', 'Automated reminders'],
    mockData: { stats: [{ l: 'Active', v: '24' }, { l: 'Reach', v: '15K+' }, { l: 'Conversion', v: '73%' }] },
  },
  {
    title: 'Automate Invoice & Incentive Validation',
    desc: 'AI-powered OCR extracts invoice data automatically. Slab-based payout engine calculates incentives in real time, with multi-level approval workflows.',
    features: ['OCR data extraction', 'Slab-based payouts', 'Multi-level approvals', 'Settlement tracking'],
    mockData: { stats: [{ l: 'Processed', v: '3,891' }, { l: 'Accuracy', v: '98%' }, { l: 'Paid Out', v: '₹24L' }] },
  },
];

export const ProductShowcase: React.FC = () => (
  <section className="lp-section" style={{ background: 'var(--lp-bg-alt)' }}>
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-20 lp-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
          style={{ background: 'var(--lp-primary-bg)', color: 'var(--lp-primary)' }}>Product</div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: 'var(--lp-text)' }}>
          Built for <span className="lp-gradient-text">Real-World Retail</span>
        </h2>
      </div>

      <div className="space-y-24">
        {SHOWCASES.map((s, i) => (
          <div key={s.title} className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:direction-rtl' : ''}`}>
            {/* Content */}
            <div className={`${i % 2 === 1 ? 'lg:order-2' : ''} ${i % 2 === 0 ? 'lp-reveal-left' : 'lp-reveal-right'}`}>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-4" style={{ color: 'var(--lp-text)' }}>{s.title}</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--lp-text-secondary)' }}>{s.desc}</p>
              <div className="grid grid-cols-2 gap-3">
                {s.features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--lp-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs font-medium" style={{ color: 'var(--lp-text-secondary)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Visual */}
            <div className={`${i % 2 === 1 ? 'lg:order-1' : ''} ${i % 2 === 0 ? 'lp-reveal-right' : 'lp-reveal-left'}`}>
              <div className="lp-card p-5">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {s.mockData.stats.map(st => (
                    <div key={st.l} className="text-center p-3 rounded-xl" style={{ background: 'var(--lp-surface)' }}>
                      <div className="text-lg font-black" style={{ color: 'var(--lp-primary)' }}>{st.v}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: 'var(--lp-text-muted)' }}>{st.l}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[75, 60, 88, 45].map((w, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg shrink-0" style={{ background: 'var(--lp-primary-bg)' }} />
                      <div className="flex-1">
                        <div className="h-2 rounded-full mb-1" style={{ background: 'var(--lp-border)' }}>
                          <div className="h-full rounded-full" style={{ width: `${w}%`, background: `var(--lp-primary)`, opacity: 0.6 }} />
                        </div>
                        <div className="h-1.5 rounded-full w-1/2" style={{ background: 'var(--lp-border)', opacity: 0.5 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
