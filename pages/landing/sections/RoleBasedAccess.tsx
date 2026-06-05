import React from 'react';

const ROLES = [
  {
    title: 'Sales Rep (ASE)',
    desc: 'Scan invoices, track daily visits, manage outlet onboarding, and submit compliance photos.',
    icon: '👤',
    features: ['Invoice scanning', 'Outlet visits', 'Photo uploads'],
    accentColor: '#4F46E5',
  },
  {
    title: 'Manager (ASM/RBL)',
    desc: 'Approve invoices, monitor team performance, view territory dashboards, and manage escalations.',
    icon: '👔',
    features: ['Team oversight', 'Approval workflows', 'Territory KPIs'],
    accentColor: '#7C3AED',
  },
  {
    title: 'Finance Admin',
    desc: 'Validate payout calculations, approve settlements, track disbursements, and generate audit reports.',
    icon: '💼',
    features: ['Payout validation', 'Settlement approval', 'Financial reports'],
    accentColor: '#059669',
  },
  {
    title: 'Admin',
    desc: 'Configure campaigns, manage users & distributors, set slab rules, and oversee the entire platform.',
    icon: '⚙️',
    features: ['User management', 'Campaign config', 'System settings'],
    accentColor: '#D97706',
  },
];

export const RoleBasedAccess: React.FC = () => (
  <section className="lp-section" style={{ background: 'var(--lp-bg-alt)' }}>
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12 lp-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
          style={{ background: 'var(--lp-primary-bg)', color: 'var(--lp-primary)' }}>Access</div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4" style={{ color: 'var(--lp-text)' }}>
          One Platform, <span className="lp-gradient-text">Every Role</span>
        </h2>
        <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--lp-text-secondary)' }}>
          Tailored experiences for every team member — from field reps to finance.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {ROLES.map((r, i) => (
          <div key={r.title} className="lp-card p-0 overflow-hidden lp-reveal group" style={{ transitionDelay: `${i * 80}ms` }}>
            {/* Colored accent top bar */}
            <div className="h-1" style={{ background: `linear-gradient(90deg, ${r.accentColor}, ${r.accentColor}88)` }} />

            <div className="p-6 text-center">
              {/* Icon in colored circle */}
              <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${r.accentColor}12`, border: `2px solid ${r.accentColor}30` }}>
                {r.icon}
              </div>

              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--lp-text)' }}>{r.title}</h3>
              <p className="text-xs leading-relaxed mb-5" style={{ color: 'var(--lp-text-secondary)' }}>{r.desc}</p>

              {/* Feature tags with accent color */}
              <div className="space-y-2">
                {r.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-[10px] font-semibold py-1.5 px-3 rounded-lg"
                    style={{ background: `${r.accentColor}08`, border: `1px solid ${r.accentColor}20`, color: r.accentColor }}>
                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
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
