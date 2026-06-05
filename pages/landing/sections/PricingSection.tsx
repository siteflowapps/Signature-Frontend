import React from 'react';

const PLANS = [
  {
    name: 'Starter',
    price: '₹4,999',
    period: '/month',
    desc: 'Perfect for small teams getting started with retail execution.',
    features: ['Up to 500 outlets', '5 team members', 'Invoice scanning', 'Basic dashboards', 'Email support'],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Growth',
    price: '₹14,999',
    period: '/month',
    desc: 'For growing teams that need advanced campaign and payout tools.',
    features: ['Up to 5,000 outlets', '25 team members', 'AI invoice OCR', 'Campaign engine', 'Payout engine', 'Priority support', 'Custom reports'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'Tailored for large organizations with complex requirements.',
    features: ['Unlimited outlets', 'Unlimited team members', 'Dedicated account manager', 'Custom integrations', 'SLA guarantees', 'On-premise option', 'White-label available'],
    cta: 'Contact Sales',
    popular: false,
  },
];

export const PricingSection: React.FC = () => (
  <section id="pricing" className="lp-section" style={{ background: 'var(--lp-bg)' }}>
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-16 lp-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
          style={{ background: 'var(--lp-primary-bg)', color: 'var(--lp-primary)' }}>Pricing</div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4" style={{ color: 'var(--lp-text)' }}>
          Simple, <span className="lp-gradient-text">Transparent Pricing</span>
        </h2>
        <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--lp-text-secondary)' }}>
          Start free. Scale as you grow. No hidden fees.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((p, i) => (
          <div key={p.name} className={`lp-card p-7 relative lp-reveal ${p.popular ? 'ring-2' : ''}`}
            style={{ transitionDelay: `${i * 100}ms`, ...(p.popular ? { ringColor: 'var(--lp-primary)', borderColor: 'var(--lp-primary)' } : {}) }}>
            {p.popular && <div className="lp-popular-badge">Most Popular</div>}
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--lp-text)' }}>{p.name}</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--lp-text-secondary)' }}>{p.desc}</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-black" style={{ color: 'var(--lp-text)' }}>{p.price}</span>
              {p.period && <span className="text-sm font-medium" style={{ color: 'var(--lp-text-muted)' }}>{p.period}</span>}
            </div>
            <button className={p.popular ? 'lp-btn-primary w-full justify-center !text-sm' : 'lp-btn-secondary w-full justify-center !text-sm'}>
              {p.cta}
            </button>
            <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--lp-border)' }}>
              <div className="space-y-3">
                {p.features.map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--lp-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs font-medium" style={{ color: 'var(--lp-text-secondary)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
