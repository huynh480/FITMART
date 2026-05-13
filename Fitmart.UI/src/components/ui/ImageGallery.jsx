import * as React from 'react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────
   ImageGallery
   Props:
     images   string[]  – ordered list of image URLs for the active color
     altBase  string    – product name for alt text prefix
───────────────────────────────────────────── */
export function ImageGallery({ images = [], altBase = 'Sản phẩm' }) {
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [mainStatus, setMainStatus] = React.useState('loading');

  // Reset to first image whenever the images list changes (color switch)
  React.useEffect(() => {
    setActiveIdx(0);
    setMainStatus('loading');
  }, [images]);

  // Reset loading state when switching thumbnails
  const handleThumb = (idx) => {
    if (idx === activeIdx) return;
    setActiveIdx(idx);
    setMainStatus('loading');
  };

  const visibleThumbs = images.slice(0, 6);
  const mainSrc = images[activeIdx] ?? '';

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* ── Main image — 4:5 aspect ratio ── */}
      <div className="relative w-full overflow-hidden bg-[#f2f2f0]" style={{ aspectRatio: '4/5' }}>
        {/* Skeleton */}
        {mainStatus === 'loading' && (
          <div className="absolute inset-0 bg-[#ebebeb] animate-pulse" />
        )}

        {/* Error fallback */}
        {mainStatus === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f2f2f0]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="#9e9e9e"
              className="size-14"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            <span style={{ color: '#9e9e9e', fontSize: 12, fontFamily: 'Roboto, sans-serif' }}>
              Không tải được ảnh
            </span>
          </div>
        )}

        {/* Actual image */}
        {mainSrc && (
          <img
            key={mainSrc}
            src={mainSrc}
            alt={`${altBase} — ảnh ${activeIdx + 1}`}
            onLoad={() => setMainStatus('loaded')}
            onError={() => setMainStatus('error')}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300 ease-in-out',
              mainStatus === 'loaded' ? 'opacity-100' : 'opacity-0 absolute inset-0'
            )}
            draggable={false}
          />
        )}

        {/* Image counter badge */}
        {mainStatus === 'loaded' && visibleThumbs.length > 1 && (
          <div
            className="absolute bottom-3 right-3 px-2 py-0.5 rounded-sm text-white text-[11px] tracking-widest"
            style={{ background: 'rgba(0,0,0,0.45)', fontFamily: 'Roboto, sans-serif' }}
          >
            {activeIdx + 1} / {visibleThumbs.length}
          </div>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {visibleThumbs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="list" aria-label="Ảnh sản phẩm">
          {visibleThumbs.map((src, idx) => (
            <ThumbItem
              key={src}
              src={src}
              idx={idx}
              isActive={idx === activeIdx}
              altBase={altBase}
              onClick={() => handleThumb(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Single thumbnail ── */
function ThumbItem({ src, idx, isActive, altBase, onClick }) {
  const [status, setStatus] = React.useState('loading');

  return (
    <button
      type="button"
      role="listitem"
      onClick={onClick}
      aria-label={`Xem ảnh ${idx + 1}`}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'relative flex-shrink-0 overflow-hidden bg-[#f2f2f0]',
        'transition-all duration-150 ease-in-out',
        'focus-visible:outline-2 focus-visible:outline-[#1b1b1b] focus-visible:outline-offset-1',
        isActive
          ? 'ring-2 ring-[#1b1b1b] ring-offset-1'
          : 'ring-1 ring-[#e0e0e0] hover:ring-[#9e9e9e] opacity-70 hover:opacity-100'
      )}
      style={{ width: 68, height: 85, flexShrink: 0 }}
    >
      {status === 'loading' && (
        <div className="absolute inset-0 bg-[#ebebeb] animate-pulse" />
      )}
      <img
        src={src}
        alt={`${altBase} — thumbnail ${idx + 1}`}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={cn(
          'w-full h-full object-cover',
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        )}
        draggable={false}
      />
    </button>
  );
}
