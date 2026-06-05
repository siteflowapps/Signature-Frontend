import React from 'react';

/* ── Shared Icon Components ── */
const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);
const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
);
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
);
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
];

interface NavbarProps {
  scrolled: boolean;
  isDark: boolean;
  toggleTheme: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  isAuthenticated: boolean;
  onSignIn: () => void;
  onDashboard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  scrolled, isDark, toggleTheme, mobileMenuOpen, setMobileMenuOpen,
  isAuthenticated, onSignIn, onDashboard,
}) => {
  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav className={`lp-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm" style={{ background: 'var(--lp-gradient-cta)' }}>S</div>
            <span className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--lp-text)' }}>Siteflow <span style={{ color: 'var(--lp-primary)' }}>CDO</span></span>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <button key={l.label} onClick={() => handleNavClick(l.href)}
                className="text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent"
                style={{ color: 'var(--lp-text-secondary)' }}>{l.label}</button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-xl border-none cursor-pointer transition-all hover:scale-105"
              style={{ background: 'var(--lp-surface)', color: 'var(--lp-text-secondary)' }}
              aria-label="Toggle theme">
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {isAuthenticated ? (
              <button onClick={onDashboard} className="lp-btn-primary !py-2.5 !px-5 !text-sm hidden sm:inline-flex">Dashboard</button>
            ) : (
              <button onClick={onSignIn} className="lp-btn-primary !py-2.5 !px-5 !text-sm hidden sm:inline-flex">Sign In</button>
            )}

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border-none cursor-pointer"
              style={{ background: 'var(--lp-surface)', color: 'var(--lp-text-secondary)' }}>
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`lp-mobile-menu ${mobileMenuOpen ? 'open' : ''}`} style={{ paddingTop: '80px' }}>
        <div className="flex flex-col items-center gap-6 p-8">
          {NAV_LINKS.map(l => (
            <button key={l.label} onClick={() => handleNavClick(l.href)}
              className="text-lg font-semibold cursor-pointer border-none bg-transparent"
              style={{ color: 'var(--lp-text)' }}>{l.label}</button>
          ))}
          <button onClick={() => { 
            setMobileMenuOpen(false); 
            if (isAuthenticated) onDashboard(); else onSignIn(); 
          }}
            className="lp-btn-primary mt-4 w-full max-w-xs justify-center">
            {isAuthenticated ? 'Dashboard' : 'Sign In'}
          </button>
        </div>
      </div>
    </>
  );
};
