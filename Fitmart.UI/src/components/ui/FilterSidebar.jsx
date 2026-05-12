import React, { useState } from 'react';

const FONT = "'Roboto','Helvetica',Arial,sans-serif";
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SORT_OPTIONS = [
  { value: 'featured', label: 'Nổi bật nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
];
const PRICE_RANGES = [
  { value: 'under300', label: 'Dưới 300.000 ₫' },
  { value: '300to700', label: '300.000 – 700.000 ₫' },
  { value: 'above700', label: 'Trên 700.000 ₫' },
];

// ─── Accordion Section ────────────────────────────────────────────────────────
function Section({ title, defaultOpen = true, hasActive = false, children }) {
  const [open, setOpen] = useState(defaultOpen || hasActive);

  return (
    <div style={{ borderBottom: '1px solid #e5e5e5' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '13px 0', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: FONT,
          fontSize: '11px', fontWeight: 700,
          color: '#1b1b1b', textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        <span>{title}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease-in-out', flexShrink: 0 }}>
          <path d="M2 4l4 4 4-4" stroke="#1b1b1b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div style={{ paddingBottom: '14px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Checkbox row ─────────────────────────────────────────────────────────────
function CheckRow({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0', cursor: 'pointer' }}>
      <span style={{
        width: '16px', height: '16px', border: checked ? 'none' : '1px solid #b0b0b0',
        borderRadius: '2px', backgroundColor: checked ? '#1b1b1b' : '#fff',
        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 125ms',
      }}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path d="M1.5 5l2.5 2.5L8.5 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
      <span style={{ fontFamily: FONT, fontSize: '13px', color: '#1b1b1b', userSelect: 'none' }}>{label}</span>
    </label>
  );
}

// ─── Radio row ────────────────────────────────────────────────────────────────
function RadioRow({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0', cursor: 'pointer' }}>
      <span style={{
        width: '16px', height: '16px', border: checked ? '4px solid #1b1b1b' : '1px solid #b0b0b0',
        borderRadius: '50%', backgroundColor: '#fff', flexShrink: 0,
        boxSizing: 'border-box', transition: 'border 125ms',
      }} />
      <input type="radio" checked={checked} onChange={onChange} style={{ display: 'none' }} />
      <span style={{ fontFamily: FONT, fontSize: '13px', color: checked ? '#1b1b1b' : '#444', fontWeight: checked ? 500 : 400, userSelect: 'none' }}>
        {label}
      </span>
    </label>
  );
}

/**
 * FilterSidebar — vertical accordion filter panel.
 *
 * Props:
 *   config          collectionConfig object (provides categories, collections)
 *   filters         { category: Set, size: Set, collection: Set, price: string|null }
 *   sort            string
 *   onFilterChange  (type, value) => void   — toggles a set value
 *   onSortChange    (value) => void
 *   onClearAll      () => void
 *   hasActiveFilters boolean
 */
export default function FilterSidebar({
  config,
  filters,
  sort,
  onFilterChange,
  onSortChange,
  onClearAll,
  hasActiveFilters,
}) {
  const categories = config?.filters?.categories ?? [];
  const collections = config?.filters?.collections ?? [];

  return (
    <aside style={{
      width: '260px',
      flexShrink: 0,
      borderRight: '1px solid #e5e5e5',
      paddingRight: '28px',
      position: 'sticky',
      top: '76px',          // Navbar height
      height: 'fit-content',
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
      alignSelf: 'flex-start',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '14px',
        borderBottom: '1px solid #e5e5e5',
        marginBottom: '0',
      }}>
        <span style={{ fontFamily: FONT, fontSize: '11px', fontWeight: 700, color: '#1b1b1b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Bộ lọc &amp; Sắp xếp
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: FONT, fontSize: '12px', color: '#6e6e6e',
              textDecoration: 'underline', textUnderlineOffset: '3px',
              padding: '0',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#1b1b1b')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6e6e6e')}
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* SẮP XẾP */}
      <Section title="Sắp xếp">
        {SORT_OPTIONS.map((opt) => (
          <RadioRow
            key={opt.value}
            label={opt.label}
            checked={sort === opt.value}
            onChange={() => onSortChange(opt.value)}
          />
        ))}
      </Section>

      {/* DANH MỤC */}
      {categories.length > 0 && (
        <Section title="Danh mục" hasActive={filters.category.size > 0}>
          {categories.map((cat) => (
            <CheckRow
              key={cat}
              label={cat}
              checked={filters.category.has(cat)}
              onChange={() => onFilterChange('category', cat)}
            />
          ))}
        </Section>
      )}

      {/* KÍCH CỠ */}
      <Section title="Kích cỡ" hasActive={filters.size.size > 0}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '2px' }}>
          {SIZES.map((sz) => {
            const active = filters.size.has(sz);
            return (
              <button
                key={sz}
                type="button"
                onClick={() => onFilterChange('size', sz)}
                style={{
                  width: '44px', height: '36px',
                  border: active ? '2px solid #1b1b1b' : '1px solid #d4d4d4',
                  background: active ? '#1b1b1b' : '#fff',
                  color: active ? '#fff' : '#1b1b1b',
                  fontFamily: FONT, fontSize: '12px', fontWeight: active ? 600 : 400,
                  cursor: 'pointer', borderRadius: '2px',
                  transition: 'border 125ms, background 125ms, color 125ms',
                }}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </Section>

      {/* GIÁ */}
      <Section title="Giá" hasActive={!!filters.price}>
        {PRICE_RANGES.map((opt) => (
          <RadioRow
            key={opt.value}
            label={opt.label}
            checked={filters.price === opt.value}
            onChange={() => onFilterChange('price', filters.price === opt.value ? null : opt.value)}
          />
        ))}
      </Section>

      {/* BỘ SƯU TẬP */}
      {collections.length > 0 && (
        <Section title="Bộ sưu tập" hasActive={filters.collection.size > 0}>
          {collections.map((col) => (
            <CheckRow
              key={col}
              label={col}
              checked={filters.collection.has(col)}
              onChange={() => onFilterChange('collection', col)}
            />
          ))}
        </Section>
      )}
    </aside>
  );
}
