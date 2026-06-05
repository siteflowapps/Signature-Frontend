import React from 'react';

const FOOTER_LINKS = {
  Product: ['Features', 'Integrations', 'Changelog'],
  Company: ['About Us', 'Careers', 'Blog', 'Contact'],
  Resources: ['Documentation', 'API Reference', 'Support', 'Status'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Security', 'GDPR'],
};

export const Footer: React.FC = () => (
  <footer className="px-6 sm:px-12 lg:px-16 pt-16 pb-8" style={{ background: 'var(--lp-bg)', borderTop: '1px solid var(--lp-border)' }}>
    <div className="max-w-6xl mx-auto">
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm" style={{ background: 'var(--lp-gradient-cta)' }}>S</div>
            <span className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--lp-text)' }}>Siteflow</span>
          </div>
          <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--lp-text-muted)' }}>
            Enterprise retail execution & campaign management platform.
          </p>
          <div className="flex gap-3">
            {['X', 'Li', 'In'].map(s => (
              <div key={s} className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all hover:scale-105"
                style={{ background: 'var(--lp-surface)', color: 'var(--lp-text-muted)', border: '1px solid var(--lp-border)' }}>{s}</div>
            ))}
          </div>
        </div>

        {/* Link Columns */}
        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title}>
            <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--lp-text-muted)' }}>{title}</h4>
            <ul className="space-y-2.5">
              {links.map(l => (
                <li key={l}>
                  <a href="#" className="text-xs font-medium transition-colors hover:opacity-80 no-underline"
                    style={{ color: 'var(--lp-text-secondary)' }}>{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid var(--lp-border)' }}>
        <p className="text-[10px] font-medium" style={{ color: 'var(--lp-text-muted)' }}>
          © {new Date().getFullYear()} Siteflow Technologies Pvt. Ltd. All rights reserved.
        </p>
        <p className="text-[10px] font-medium" style={{ color: 'var(--lp-text-muted)' }}>
          Powered by <span className="font-bold" style={{ color: 'var(--lp-primary)' }}>siteflow.tech</span>
        </p>
      </div>
    </div>
  </footer>
);
