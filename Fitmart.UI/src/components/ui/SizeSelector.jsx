import * as React from 'react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────
   SizeSelector
   Props:
     sizes       Array<{ label, inStock }>  – size options
     selectedSize string | null             – currently selected size label
     onChange    (label) => void            – selection callback
───────────────────────────────────────────── */
export function SizeSelector({ sizes = [], selectedSize, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: 12,
              fontWeight: 500,
              color: '#6e6e6e',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Kích cỡ
          </span>
          {selectedSize && (
            <span
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: 12,
                fontWeight: 400,
                color: '#1b1b1b',
              }}
            >
              — {selectedSize}
            </span>
          )}
        </div>
        <button
          type="button"
          style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: 11,
            fontWeight: 400,
            color: '#6e6e6e',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            letterSpacing: '0.04em',
          }}
        >
          Hướng dẫn chọn size
        </button>
      </div>

      {/* Size grid */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: 'repeat(6, minmax(44px, 1fr))' }}
        role="radiogroup"
        aria-label="Chọn kích cỡ"
      >
        {sizes.map((size) => {
          const isSelected = size.label === selectedSize;
          const isOutOfStock = !size.inStock;

          return (
            <button
              key={size.label}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={isOutOfStock ? `${size.label} — hết hàng` : `Size ${size.label}`}
              disabled={isOutOfStock}
              onClick={() => !isOutOfStock && onChange(size.label)}
              className={cn(
                'relative h-11 text-[13px] transition-all duration-150 ease-in-out',
                'focus-visible:outline-2 focus-visible:outline-[#1b1b1b] focus-visible:outline-offset-1',
                // Default
                !isSelected && !isOutOfStock && [
                  'border border-[#d0d0d0] bg-white text-[#1b1b1b]',
                  'hover:border-[#1b1b1b] hover:bg-[#fafafa]',
                ],
                // Selected
                isSelected && 'border-2 border-[#1b1b1b] bg-[#1b1b1b] text-white font-medium',
                // Out of stock
                isOutOfStock && [
                  'border border-[#e0e0e0] bg-[#fafafa] text-[#c0c0c0] cursor-not-allowed',
                  'diagonal-line-through', // custom via pseudo
                ]
              )}
              style={{
                fontFamily: 'Roboto, sans-serif',
                letterSpacing: '0.05em',
                // Strike-through visual for OOS
                ...(isOutOfStock && {
                  background: 'repeating-linear-gradient(-45deg, transparent, transparent 4px, #e0e0e0 4px, #e0e0e0 5px)',
                }),
              }}
            >
              {/* Out-of-stock: diagonal line overlay */}
              {isOutOfStock && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    color: '#b0b0b0',
                    fontFamily: 'Roboto, sans-serif',
                    background: 'transparent',
                  }}
                >
                  {size.label}
                </span>
              )}
              {!isOutOfStock && size.label}
            </button>
          );
        })}
      </div>

      {/* OOS legend */}
      <p
        style={{
          fontFamily: 'Roboto, sans-serif',
          fontSize: 11,
          color: '#9e9e9e',
          margin: 0,
        }}
      >
        Kẻ sọc = hết hàng
      </p>
    </div>
  );
}
