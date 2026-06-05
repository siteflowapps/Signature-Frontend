import React from 'react';

interface FinalCTAProps {
  isAuthenticated: boolean;
  onSignIn: () => void;
  onDashboard: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ isAuthenticated, onSignIn, onDashboard }) => (
  <section className="lp-section relative overflow-hidden" style={{ background: 'var(--lp-gradient-cta)' }}>
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[5%] w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px]" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
    </div>
    <div className="max-w-3xl mx-auto text-center relative z-10 lp-reveal">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-5 leading-tight">
        Ready to Scale Your Retail Execution?
      </h2>
      <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto leading-relaxed">
        Join thousands of field teams using Siteflow CDO to manage outlets, execute campaigns, and drive growth.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <button onClick={isAuthenticated ? onDashboard : onSignIn}
          className="bg-white font-bold py-3.5 px-8 rounded-xl text-sm transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] cursor-pointer border-none"
          style={{ color: 'var(--lp-primary-dark)' }}>
          {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
        </button>
        <button className="bg-white/10 text-white font-bold py-3.5 px-8 rounded-xl text-sm transition-all hover:bg-white/20 hover:-translate-y-1 cursor-pointer border border-white/20 backdrop-blur-sm">
          Schedule a Demo
        </button>
      </div>
    </div>
  </section>
);
