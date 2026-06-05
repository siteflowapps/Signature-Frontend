import React from 'react';

interface SlideOverPanelProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  statusBadge?: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Reusable slide-over panel component.
 * Renders a right-aligned overlay panel with backdrop, header, scrollable content, and optional footer.
 */
export const SlideOverPanel: React.FC<SlideOverPanelProps> = ({
  isOpen,
  title,
  subtitle,
  statusBadge,
  onClose,
  footer,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            {subtitle && <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{subtitle}</p>}
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
          </div>
          <div className="flex items-center gap-3">
            {statusBadge}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all border border-slate-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-8 pt-5 border-t border-slate-100 shrink-0 bg-slate-50/50">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};
