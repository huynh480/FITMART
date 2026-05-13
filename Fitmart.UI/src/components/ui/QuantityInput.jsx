import * as React from 'react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────
   QuantityInput
   Props:
     value     number              – current quantity
     onChange  (number) => void   – quantity change callback
     min       number (default 1)
     max       number (default 99)
───────────────────────────────────────────── */
export function QuantityInput({ value = 1, onChange, min = 1, max = 99 }) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  const handleChange = (e) => {
    const parsed = parseInt(e.target.value, 10);
    if (isNaN(parsed)) return;
    onChange(Math.max(min, Math.min(max, parsed)));
  };

  const handleBlur = (e) => {
    const parsed = parseInt(e.target.value, 10);
    if (isNaN(parsed) || parsed < min) onChange(min);
    else if (parsed > max) onChange(max);
  };

  const btnBase = cn(
    'flex items-center justify-center w-11 h-11',
    'border border-[#d0d0d0] bg-white',
    'text-[#1b1b1b] text-lg leading-none',
    'transition-colors duration-125 ease-in-out',
    'hover:bg-[#f5f5f5] hover:border-[#1b1b1b]',
    'active:bg-[#ebebeb]',
    'focus-visible:outline-2 focus-visible:outline-[#1b1b1b] focus-visible:outline-offset-1',
    'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-[#d0d0d0]'
  );

  return (
    <div className="flex flex-col gap-2">
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
        Số lượng
      </span>
      <div className="inline-flex items-center" role="group" aria-label="Số lượng sản phẩm">
        {/* Decrement */}
        <button
          id="qty-decrement"
          type="button"
          aria-label="Giảm số lượng"
          disabled={value <= min}
          onClick={handleDecrement}
          className={btnBase}
          style={{ borderRight: 'none', fontFamily: 'Roboto, sans-serif' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-4"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        </button>

        {/* Input */}
        <input
          id="qty-input"
          type="number"
          inputMode="numeric"
          aria-label="Số lượng"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          style={{
            width: 52,
            height: 44,
            border: '1px solid #d0d0d0',
            borderLeft: 'none',
            borderRight: 'none',
            textAlign: 'center',
            fontFamily: 'Roboto, sans-serif',
            fontSize: 14,
            fontWeight: 500,
            color: '#1b1b1b',
            background: '#fff',
            outline: 'none',
            MozAppearance: 'textfield',
            WebkitAppearance: 'none',
          }}
          // hide browser number spin buttons
          onWheel={(e) => e.currentTarget.blur()}
        />

        {/* Increment */}
        <button
          id="qty-increment"
          type="button"
          aria-label="Tăng số lượng"
          disabled={value >= max}
          onClick={handleIncrement}
          className={btnBase}
          style={{ borderLeft: 'none', fontFamily: 'Roboto, sans-serif' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-4"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
