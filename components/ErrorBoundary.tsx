import React, { Component, ErrorInfo } from 'react';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 text-slate-800 selection:bg-rose-500/30">
          <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] text-center animate-in zoom-in-95 duration-500 relative overflow-hidden flex flex-col items-center border border-slate-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none opacity-60" />
            
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6 shadow-inner relative z-10">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2 relative z-10">Oops, something broke.</h1>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed relative z-10">
              We encountered an unexpected error while rendering this page.
              <br className="hidden sm:block" />
              Our team has been notified.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full relative z-10">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-xl transition-all active:scale-[0.98] border border-slate-200"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all hover:-translate-y-0.5 active:scale-[0.98] shadow-lg shadow-indigo-600/20"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
          
          <p className="mt-8 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            Error details logged to console
          </p>
        </div>
      );
    }

    return ((this as unknown) as { props: Props }).props.children;
  }
}

export default ErrorBoundary;
