import React, { useState, useEffect, useCallback } from 'react';

interface Photo {
  url: string;
  caption: string;
}

interface PhotoLightboxProps {
  isOpen: boolean;
  photos: Photo[];
  initialIndex?: number;
  onClose: () => void;
}

/**
 * Reusable fullscreen photo lightbox with keyboard navigation.
 * Supports arrow key navigation (←, →) and ESC to close.
 */
export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  isOpen,
  photos,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Sync initial index when it changes externally
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const navigate = useCallback((direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  }, [photos.length]);

  // Keyboard handlers
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') navigate('next');
      if (e.key === 'ArrowLeft') navigate('prev');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, navigate, onClose]);

  if (!isOpen || photos.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-6 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm font-black uppercase tracking-widest">{currentIndex + 1} / {photos.length}</span>
          <span className="text-white/40 text-xs font-bold">{photos[currentIndex]?.caption}</span>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-md border border-white/5"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Image */}
      <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center relative px-20">
        {photos.length > 1 && (
          <button
            onClick={() => navigate('prev')}
            className="absolute left-6 w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all backdrop-blur-md border border-white/5 hover:scale-105 active:scale-95"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <img
          key={currentIndex}
          src={photos[currentIndex]?.url}
          alt={photos[currentIndex]?.caption}
          className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        />
        {photos.length > 1 && (
          <button
            onClick={() => navigate('next')}
            className="absolute right-6 w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all backdrop-blur-md border border-white/5 hover:scale-105 active:scale-95"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Thumbnail Strip */}
      {photos.length > 1 && (
        <div className="flex items-center justify-center gap-3 p-6 shrink-0">
          {photos.map((photo, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                idx === currentIndex
                  ? 'border-white shadow-lg shadow-white/20 scale-110'
                  : 'border-white/20 opacity-50 hover:opacity-80 hover:border-white/40'
              }`}
            >
              <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="text-center pb-4">
        <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">← → Navigate &nbsp;·&nbsp; ESC Close</span>
      </div>
    </div>
  );
};
