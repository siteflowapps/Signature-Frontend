import React from 'react';

const STEPS = [
  { num: '01', title: 'Discover & Onboard', desc: 'Identify outlets, complete recce, and activate them into your retail network.', icon: '🏪' },
  { num: '02', title: 'Execute Campaigns', desc: 'Deploy visibility programs, track signage compliance, and drive distribution.', icon: '🚀' },
  { num: '03', title: 'Track Performance', desc: 'Monitor daily field activities, outlet health scores, and sales metrics.', icon: '📊' },
  { num: '04', title: 'Validate & Payout', desc: 'Scan invoices, calculate slab incentives, and process settlements.', icon: '💰' },
];

/* Arrow connector between steps */
const StepArrow = () => (
  <div className="hidden lg:flex items-center justify-center absolute top-7 -right-[18px] z-20">
    <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
      <path d="M0 12h28m0 0l-6-6m6 6l-6 6" stroke="var(--lp-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    </svg>
  </div>
);

export const HowItWorks: React.FC = () => (
  <section id="how-it-works" className="lp-section" style={{ background: 'var(--lp-bg)' }}>
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12 lp-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
          style={{ background: 'var(--lp-primary-bg)', color: 'var(--lp-primary)' }}>Process</div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4" style={{ color: 'var(--lp-text)' }}>
          How It <span className="lp-gradient-text">Works</span>
        </h2>
        <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--lp-text-secondary)' }}>
          Four simple steps to transform your retail execution workflow.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {/* Dashed connector line (desktop) */}
        <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-[2px]"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, var(--lp-primary) 0, var(--lp-primary) 8px, transparent 8px, transparent 16px)`,
            opacity: 0.2,
          }} />

        {STEPS.map((s, i) => (
          <div key={s.num} className="text-center relative lp-reveal" style={{ transitionDelay: `${i * 100}ms` }}>
            {/* Step icon with numbered badge */}
            <div className="relative inline-block mb-5">
              <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl relative z-10 transition-transform duration-300 hover:scale-110"
                style={{ background: 'var(--lp-bg-card)', border: '2px solid var(--lp-border)', boxShadow: 'var(--lp-shadow-md)' }}>
                {s.icon}
              </div>
              {/* Step number badge */}
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white z-20"
                style={{ background: 'var(--lp-gradient-cta)' }}>
                {i + 1}
              </div>
            </div>

            {/* Arrow connector between steps */}
            {i < STEPS.length - 1 && <StepArrow />}

            <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--lp-primary)' }}>Step {s.num}</div>
            <h3 className="text-base font-bold mb-2" style={{ color: 'var(--lp-text)' }}>{s.title}</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--lp-text-secondary)' }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
