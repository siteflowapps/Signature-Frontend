import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 text-slate-800 selection:bg-orange-500/30">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] text-center animate-in zoom-in-95 duration-500 relative overflow-hidden flex flex-col items-center border border-slate-100">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none opacity-50" />
        
        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6 shadow-inner relative z-10">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2 relative z-10">Access Denied</h1>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed relative z-10">
          You don't have the necessary permissions to view this page. If you believe this is a mistake, please contact your administrator.
        </p>
        
        <Link 
          to="/dashboard"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all hover:-translate-y-0.5 active:scale-[0.98] shadow-lg shadow-indigo-600/20 relative z-10"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
