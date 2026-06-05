import React from 'react';

export const InvoiceAISection: React.FC = () => (
  <section className="lp-section relative overflow-hidden" style={{ background: 'var(--lp-bg)' }}>
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left — Content */}
        <div className="lp-reveal">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6"
            style={{ background: 'var(--lp-primary-bg)', color: 'var(--lp-primary)' }}>
            ✦ Core Differentiator
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black leading-tight tracking-tight mb-5" style={{ color: 'var(--lp-text)' }}>
            Turn Every Invoice Into Actionable Data —{' '}
            <span className="lp-gradient-text">Instantly</span>
          </h2>
          <p className="text-base leading-relaxed mb-8 max-w-lg" style={{ color: 'var(--lp-text-secondary)' }}>
            AI-powered invoice scanning built for real-world retail. Capture, validate, and process invoices directly from your mobile device.
          </p>

          <div className="space-y-4 mb-8">
            {[
              { icon: '📸', text: 'Scan invoices using Android & iOS apps' },
              { icon: '🤖', text: 'AI-powered OCR extracts structured data automatically' },
              { icon: '🔍', text: 'Auto-detect: Invoice No, Date, Distributor, SKU, Quantity, Value' },
              { icon: '✅', text: 'Manual correction + validation before submission' },
              { icon: '🔗', text: 'Instantly linked to Outlet, Campaign & Sales Rep' },
              { icon: '📊', text: 'Auto-sync to dashboard & reports' },
            ].map(item => (
              <div key={item.text} className="flex items-start gap-3">
                <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--lp-text-secondary)' }}>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            {['Works with Indian distributor invoices', 'Handles multiple formats', 'Built for low-network environments'].map(t => (
              <span key={t} className="text-[10px] font-bold px-3 py-1.5 rounded-full"
                style={{ background: 'var(--lp-surface)', color: 'var(--lp-text-muted)', border: '1px solid var(--lp-border)' }}>{t}</span>
            ))}
          </div>

          <div className="flex gap-3">
            <button className="lp-btn-primary !text-sm">Try Invoice Scanning</button>
            <button className="lp-btn-secondary !text-sm">See Demo</button>
          </div>
        </div>

        {/* Right — Phone Mockups */}
        <div className="lp-reveal-right relative flex items-center justify-center gap-6">
          {/* Android Phone */}
          <div className="lp-phone-mockup" style={{ animation: 'lp-float-slow 6s ease-in-out infinite' }}>
            <div className="lp-phone-notch" />
            <div className="p-4 pt-8">
              <div className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--lp-text-muted)' }}>Camera Scanner</div>
              {/* Fake Invoice */}
              <div className="rounded-lg p-3 mb-3 relative overflow-hidden" style={{ background: 'var(--lp-surface)', border: '1px solid var(--lp-border)' }}>
                <div className="space-y-2">
                  <div className="h-2 rounded-full w-3/4" style={{ background: 'var(--lp-border)' }} />
                  <div className="h-2 rounded-full w-1/2" style={{ background: 'var(--lp-border)' }} />
                  <div className="h-2 rounded-full w-5/6" style={{ background: 'var(--lp-border)' }} />
                  <div className="h-2 rounded-full w-2/3" style={{ background: 'var(--lp-border)' }} />
                  <div className="h-2 rounded-full w-3/5" style={{ background: 'var(--lp-border)' }} />
                  <div className="h-2 rounded-full w-4/5" style={{ background: 'var(--lp-border)' }} />
                  <div className="h-2 rounded-full w-1/2" style={{ background: 'var(--lp-border)' }} />
                </div>
                {/* Scan Line */}
                <div className="lp-scan-line" />
              </div>
              {/* Extracted data */}
              <div className="space-y-2" style={{ animation: 'lp-data-flash 3s ease-in-out infinite' }}>
                {[['Invoice #', 'INV-2847'], ['Date', '19 Mar 2026'], ['Amount', '₹12,450']].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center text-[10px]">
                    <span style={{ color: 'var(--lp-text-muted)' }}>{k}</span>
                    <span className="font-bold" style={{ color: 'var(--lp-primary)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* iPhone */}
          <div className="lp-phone-mockup hidden sm:block" style={{ marginTop: '60px', animation: 'lp-float-medium 7s ease-in-out infinite' }}>
            <div className="lp-phone-notch" style={{ width: '120px', borderRadius: '0 0 20px 20px' }} />
            <div className="p-4 pt-8">
              <div className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--lp-text-muted)' }}>Extracted Data</div>
              <div className="space-y-2.5">
                {[
                  ['Distributor', 'Sharma Beverages'],
                  ['SKU', 'Campa Cola 250ml'],
                  ['Quantity', '48 cases'],
                  ['Value', '₹12,450.00'],
                  ['Outlet', 'RS Mart - Sector 21'],
                  ['Sales Rep', 'Rahul K.'],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg p-2" style={{ background: 'var(--lp-surface)', border: '1px solid var(--lp-border)' }}>
                    <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: 'var(--lp-text-muted)' }}>{k}</div>
                    <div className="text-[11px] font-bold mt-0.5" style={{ color: 'var(--lp-text)' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[80px] opacity-15" style={{ background: 'var(--lp-primary)' }} />
          </div>
        </div>
      </div>
    </div>
  </section>
);
