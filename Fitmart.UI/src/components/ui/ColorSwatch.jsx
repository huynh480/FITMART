import * as React from 'react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────
   ColorSwatch
   Props:
     colors        Array<{ id, name, hex }> – color options
     selectedId    string                   – currently selected color id
     onChange      (colorId) => void        – selection callback
───────────────────────────────────────────── */
export function ColorSwatch({ colors = [], selectedId, onChange }) {
  const [tooltipId, setTooltipId] = React.useState(null);

  const selectedColor = colors.find((c) => c.id === selectedId);

  return (
    <div className="flex flex-col gap-2">
      {/* Label row */}
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
          Màu sắc
        </span>
        {selectedColor && (
          <span
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: 12,
              fontWeight: 400,
              color: '#1b1b1b',
            }}
          >
            — {selectedColor.name}
          </span>
        )}
      </div>

      {/* Swatch dots */}
      <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Chọn màu sắc">
        {colors.map((color) => {
          const isSelected = color.id === selectedId;
          const isLight = isColorLight(color.hex);
          return (
            <div key={color.id} className="relative" style={{ position: 'relative' }}>
              {/* Tooltip */}
              {tooltipId === color.id && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1b1b1b',
                    color: '#ffffff',
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: 11,
                    fontWeight: 400,
                    padding: '4px 8px',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 10,
                    borderRadius: 2,
                  }}
                >
                  {color.name}
                  {/* Arrow */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '4px solid transparent',
                      borderRight: '4px solid transparent',
                      borderTop: '4px solid #1b1b1b',
                    }}
                  />
                </div>
              )}

              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`Màu ${color.name}`}
                onClick={() => onChange(color.id)}
                onMouseEnter={() => setTooltipId(color.id)}
                onMouseLeave={() => setTooltipId(null)}
                onFocus={() => setTooltipId(color.id)}
                onBlur={() => setTooltipId(null)}
                className={cn(
                  'relative w-8 h-8 rounded-full transition-all duration-150 ease-in-out',
                  'focus-visible:outline-2 focus-visible:outline-[#1b1b1b] focus-visible:outline-offset-2',
                  isSelected
                    ? 'ring-2 ring-offset-2 ring-[#1b1b1b] scale-105'
                    : 'hover:scale-105',
                  isLight && 'ring-1 ring-[#d0d0d0]'
                )}
                style={{
                  background: color.hex,
                }}
              >
                {/* Checkmark for selected */}
                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill={isLight ? '#1b1b1b' : '#ffffff'}
                    className="absolute inset-0 m-auto size-3.5"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Simple luminance check to pick a light/dark ring */
function isColorLight(hex) {
  const c = hex.replace('#', '');
  if (c.length < 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.7;
}
