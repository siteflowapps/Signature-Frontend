import React from 'react';

const FEATURES = [
  {
    title: 'Outlet Lifecycle Management',
    desc: 'Discovery to activation — manage every outlet stage with precision. Track onboarding, compliance, and outlet health in real-time.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    ),
    gradient: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
  },
  {
    title: 'Campaign Execution Engine',
    desc: 'Run Operation Blue, PFP programs with full execution tracking. Monitor KPIs and field team performance at every level.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
    ),
    gradient: 'linear-gradient(135deg, #7C3AED, #A855F7)',
  },
  {
    title: 'Field Sales Tracking',
    desc: 'Real-time geo-tagged visits with daily performance metrics. Photo-verified audits ensure ground-level compliance.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    ),
    gradient: 'linear-gradient(135deg, #059669, #10B981)',
  },
  {
    title: 'Invoice OCR & Validation',
    desc: 'AI-powered scanning with auto-detection and manual correction. Works with Indian distributor invoices across formats.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    ),
    gradient: 'linear-gradient(135deg, #D97706, #F59E0B)',
  },
  {
    title: 'Incentive & Payout Engine',
    desc: 'Automated slab-based calculations with settlement tracking. Multi-level approvals and real-time payout dashboards.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    ),
    gradient: 'linear-gradient(135deg, #E11D48, #F43F5E)',
  },
  {
    title: 'Analytics & Reporting',
    desc: 'Role-based dashboards with real-time KPIs and exports. Territory-level analytics that drive actionable insights.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    ),
    gradient: 'linear-gradient(135deg, #0891B2, #06B6D4)',
  },
];

export const FeaturesGrid: React.FC = () => (
  <section id="features" className="lp-section" style={{ background: 'var(--lp-bg)' }}>
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12 lp-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
          style={{ background: 'var(--lp-primary-bg)', color: 'var(--lp-primary)' }}>Features</div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4" style={{ color: 'var(--lp-text)' }}>
          Everything You Need to <span className="lp-gradient-text">Execute at Scale</span>
        </h2>
        <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--lp-text-secondary)' }}>
          A complete suite of tools designed for enterprise retail execution and campaign management.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => (
          <div key={f.title} className="lp-card lp-gradient-border p-6 lp-reveal group" style={{ transitionDelay: `${i * 70}ms` }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white transition-transform duration-300 group-hover:scale-110"
              style={{ background: f.gradient, boxShadow: `0 4px 16px ${f.gradient.includes('#4F46E5') ? 'rgba(79,70,229,0.25)' : 'rgba(0,0,0,0.15)'}` }}>
              {f.icon}
            </div>
            <h3 className="text-base font-bold mb-2" style={{ color: 'var(--lp-text)' }}>{f.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-text-secondary)' }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
