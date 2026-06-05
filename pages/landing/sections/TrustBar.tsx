import React from 'react';

/* Real brand-style SVG icons for each partner */
const BrandIcon = ({ letter, color }: { letter: string; color: string }) => (
  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black text-white flex-shrink-0"
    style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)`, boxShadow: `0 2px 8px ${color}30` }}>
    {letter}
  </div>
);

const BRANDS = [
  { name: 'Reliance CP', icon: 'R', color: '#0052CC' },
  { name: 'Campa Cola', icon: 'C', color: '#E11D48' },
  { name: 'Parle Agro', icon: 'P', color: '#16A34A' },
  { name: 'Havmor', icon: 'H', color: '#D97706' },
  { name: 'Bisleri', icon: 'B', color: '#0891B2' },
];

export const TrustBar: React.FC = () => (
  <section className="lp-trust-section" style={{ background: 'var(--lp-bg-alt)', borderTop: '1px solid var(--lp-border-subtle)', borderBottom: '1px solid var(--lp-border-subtle)' }}>
    <div className="max-w-6xl mx-auto text-center lp-reveal">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-8" style={{ color: 'var(--lp-text-muted)' }}>
        Trusted by leading FMCG & retail brands across India
      </p>
      <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap">
        {BRANDS.map(brand => (
          <div key={brand.name} className="lp-trust-logo flex items-center gap-2.5 transition-all duration-300" style={{ opacity: 0.65 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.65')}>
            <BrandIcon letter={brand.icon} color={brand.color} />
            <span className="text-sm font-bold hidden sm:inline" style={{ color: 'var(--lp-text-secondary)' }}>{brand.name}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);
