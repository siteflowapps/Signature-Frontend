import React, { useEffect, useRef, useState } from 'react';

interface HeroProps {
  isAuthenticated: boolean;
  onSignIn: () => void;
  onDashboard: () => void;
}

const ArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
);

/* ── Animated Counter Hook ── */
const useCounter = (target: string, duration = 2000) => {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          const suffix = target.replace(/[\d.,]/g, '');
          const numStr = target.replace(/[^\d.]/g, '');
          const end = parseFloat(numStr);
          const isFloat = numStr.includes('.');
          const startTime = performance.now();

          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
            const current = eased * end;
            if (isFloat) {
              setDisplay(current.toFixed(1) + suffix);
            } else {
              const formatted = Math.round(current).toLocaleString();
              setDisplay(formatted + suffix);
            }
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, display };
};

/* ── Mini Sparkline ── */
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 32;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="lp-sparkline">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
      <circle cx={(w).toString()} cy={(h - ((data[data.length - 1] - min) / range) * h).toString()} r="3" fill={color} />
    </svg>
  );
};

export const HeroSection: React.FC<HeroProps> = ({ isAuthenticated, onSignIn, onDashboard }) => {
  const stat1 = useCounter('15K+');
  const stat2 = useCounter('98%');
  const stat3 = useCounter('2.4x');

  return (
    <section className="lp-section relative overflow-hidden" style={{ background: 'var(--lp-gradient-hero)', paddingTop: '140px' }}>
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20" style={{ background: 'var(--lp-primary)' }} />
        <div className="absolute bottom-0 left-[5%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-10" style={{ background: 'var(--lp-accent)' }} />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Content */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6"
              style={{ background: 'var(--lp-primary-bg)', color: 'var(--lp-primary)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--lp-accent)' }} />
              Enterprise Retail Execution Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight mb-6" style={{ color: 'var(--lp-text)' }}>
              Execute Retail.{' '}
              <span className="lp-gradient-text">Track Performance.</span>{' '}
              Maximize Growth.
            </h1>
            <p className="text-lg leading-relaxed mb-8 max-w-md" style={{ color: 'var(--lp-text-secondary)' }}>
              The all-in-one platform for outlet management, campaign execution, AI-powered invoice processing, and incentive payouts.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={isAuthenticated ? onDashboard : onSignIn} className="lp-btn-primary">
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'} <ArrowIcon />
              </button>
              <a href="#how-it-works" className="lp-btn-secondary" onClick={e => { e.preventDefault(); document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>
                Book Demo
              </a>
            </div>
            {/* Animated Stats */}
            <div className="flex items-center gap-6 mt-10">
              {[
                { ref: stat1.ref, display: stat1.display, label: 'Outlets Managed' },
                { ref: stat2.ref, display: stat2.display, label: 'Accuracy' },
                { ref: stat3.ref, display: stat3.display, label: 'Faster Ops' },
              ].map(s => (
                <div key={s.label} ref={s.ref}>
                  <div className="text-2xl font-black" style={{ color: 'var(--lp-text)' }}>{s.display}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--lp-text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Polished Dashboard Mock */}
          <div className="relative hidden lg:block">
            <div className="lp-dashboard-mock p-1">
              {/* Window Chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3" style={{ background: 'var(--lp-surface)', borderBottom: '1px solid var(--lp-border)' }}>
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-400/60" />
                <div className="flex-1 mx-4">
                  <div className="flex items-center gap-2 h-6 rounded-lg px-3" style={{ background: 'var(--lp-bg)', border: '1px solid var(--lp-border)' }}>
                    <svg className="w-3 h-3" style={{ color: 'var(--lp-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-[9px] font-semibold" style={{ color: 'var(--lp-text-muted)' }}>app.signatureoutlets.tech/dashboard</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-5" style={{ background: 'var(--lp-bg-alt)' }}>
                {/* Stat Cards Row */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Outlets', value: '15,247', change: '+12%', color: '#4F46E5', sparkData: [20, 35, 30, 45, 40, 55, 50, 60, 55, 70, 65, 75] },
                    { label: 'Invoices', value: '3,891', change: '+8%', color: '#059669', sparkData: [30, 25, 40, 35, 50, 45, 55, 60, 50, 65, 70, 68] },
                    { label: 'Campaigns', value: '24', change: 'Active', color: '#7C3AED', sparkData: [10, 15, 12, 20, 18, 22, 24, 20, 18, 24, 22, 24] },
                    { label: 'Payouts', value: '₹24.1L', change: 'This Month', color: '#D97706', sparkData: [40, 50, 45, 60, 55, 70, 65, 80, 75, 85, 90, 95] },
                  ].map(card => (
                    <div key={card.label} className="rounded-xl p-3" style={{ background: 'var(--lp-bg-card)', border: '1px solid var(--lp-border)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--lp-text-muted)' }}>{card.label}</div>
                        <div className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${card.color}15`, color: card.color }}>{card.change}</div>
                      </div>
                      <div className="text-xl font-black mb-1" style={{ color: 'var(--lp-text)' }}>{card.value}</div>
                      <Sparkline data={card.sparkData} color={card.color} />
                    </div>
                  ))}
                </div>

                {/* Chart Area */}
                <div className="rounded-xl p-4 mb-3" style={{ background: 'var(--lp-bg-card)', border: '1px solid var(--lp-border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold" style={{ color: 'var(--lp-text)' }}>Monthly Performance</div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: '#4F46E5' }} />
                        <span className="text-[9px] font-semibold" style={{ color: 'var(--lp-text-muted)' }}>Revenue</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: '#059669' }} />
                        <span className="text-[9px] font-semibold" style={{ color: 'var(--lp-text-muted)' }}>Targets</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end gap-[6px] h-24">
                    {[
                      { h1: 40, h2: 35 }, { h1: 55, h2: 50 }, { h1: 48, h2: 55 },
                      { h1: 72, h2: 65 }, { h1: 65, h2: 70 }, { h1: 80, h2: 72 },
                      { h1: 75, h2: 78 }, { h1: 68, h2: 70 }, { h1: 88, h2: 80 },
                      { h1: 60, h2: 65 }, { h1: 82, h2: 78 }, { h1: 95, h2: 85 },
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex gap-[2px] items-end">
                        <div className="flex-1 rounded-t-sm transition-all" style={{ height: `${bar.h1}%`, background: '#4F46E5', opacity: i === 11 ? 1 : 0.7 }} />
                        <div className="flex-1 rounded-t-sm transition-all" style={{ height: `${bar.h2}%`, background: '#059669', opacity: i === 11 ? 1 : 0.5 }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                      <span key={m} className="text-[7px] font-bold flex-1 text-center" style={{ color: 'var(--lp-text-muted)' }}>{m}</span>
                    ))}
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Recent Activity */}
                  <div className="rounded-xl p-3" style={{ background: 'var(--lp-bg-card)', border: '1px solid var(--lp-border)' }}>
                    <div className="text-[10px] font-bold mb-2.5" style={{ color: 'var(--lp-text-muted)' }}>Recent Activity</div>
                    {[
                      { label: 'Invoice #INV-2847 scanned', time: '2m ago', dot: '#059669' },
                      { label: 'Outlet RS-Mart activated', time: '15m ago', dot: '#4F46E5' },
                      { label: 'Campaign "Blue Q4" launched', time: '1h ago', dot: '#7C3AED' },
                    ].map((item, j) => (
                      <div key={j} className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.dot }} />
                        <div className="flex-1 text-[9px] font-semibold truncate" style={{ color: 'var(--lp-text-secondary)' }}>{item.label}</div>
                        <div className="text-[8px] font-bold flex-shrink-0" style={{ color: 'var(--lp-text-muted)' }}>{item.time}</div>
                      </div>
                    ))}
                  </div>

                  {/* Top Outlets */}
                  <div className="rounded-xl p-3" style={{ background: 'var(--lp-bg-card)', border: '1px solid var(--lp-border)' }}>
                    <div className="text-[10px] font-bold mb-2.5" style={{ color: 'var(--lp-text-muted)' }}>Top Outlets</div>
                    {[
                      { name: 'RS Mart, Sector 21', pct: 92 },
                      { name: 'Metro Point, MG Road', pct: 85 },
                      { name: 'City Store, Koramangala', pct: 78 },
                    ].map((outlet, j) => (
                      <div key={j} className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-semibold truncate" style={{ color: 'var(--lp-text-secondary)' }}>{outlet.name}</span>
                          <span className="text-[9px] font-black" style={{ color: 'var(--lp-primary)' }}>{outlet.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: 'var(--lp-border)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${outlet.pct}%`, background: 'linear-gradient(90deg, #4F46E5, #7C3AED)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
