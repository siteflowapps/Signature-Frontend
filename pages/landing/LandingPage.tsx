import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from './sections/Navbar';
import { HeroSection } from './sections/HeroSection';
import { InvoiceAISection } from './sections/InvoiceAISection';

import { FeaturesGrid } from './sections/FeaturesGrid';
import { ProductShowcase } from './sections/ProductShowcase';
import { HowItWorks } from './sections/HowItWorks';
import { RoleBasedAccess } from './sections/RoleBasedAccess';
import { SignInModal } from './sections/SignInModal';
import { FinalCTA } from './sections/FinalCTA';
import { Footer } from './sections/Footer';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const getRedirectPath = () => {
    if (user?.role === 'SUPPORT') return '/support-dashboard';
    if (user?.role === 'DISTRIBUTOR_MANAGER') return '/my-distributors';
    return '/dashboard';
  };

  // Dark mode toggle
  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  // Scroll listener for navbar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll reveal with IntersectionObserver
  useEffect(() => {
    const els = document.querySelectorAll('.lp-reveal, .lp-reveal-left, .lp-reveal-right');
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleSignIn = () => setShowSignIn(true);
  const handleDashboard = () => navigate(getRedirectPath());

  return (
    <div className="lp min-h-screen">
      <Navbar
        scrolled={scrolled}
        isDark={isDark}
        toggleTheme={toggleTheme}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isAuthenticated={isAuthenticated}
        onSignIn={handleSignIn}
        onDashboard={handleDashboard}
      />
      <HeroSection isAuthenticated={isAuthenticated} onSignIn={handleSignIn} onDashboard={handleDashboard} />
      <InvoiceAISection />

      <FeaturesGrid />
      <ProductShowcase />
      <HowItWorks />
      <RoleBasedAccess />

      <FinalCTA isAuthenticated={isAuthenticated} onSignIn={handleSignIn} onDashboard={handleDashboard} />
      <Footer />
      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
    </div>
  );
};

export default LandingPage;
