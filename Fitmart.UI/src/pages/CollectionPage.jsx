import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Select, Pagination } from 'antd';
import { ProductCard, ProductGrid } from '../components/ProductCard';

const { Option } = Select;

const PAGE_SIZE = 24;
const API_BASE = 'http://localhost:5049/api/Products';

// ─── Category metadata ────────────────────────────────────────────────────────
const CATEGORY_META = {
  nam: { label: 'Nam', heroImage: '/mega_menu_nam.png', apiCategory: 'nam' },
  nu: { label: 'Nữ', heroImage: '/mega_menu_nu.png', apiCategory: 'nu' },
  'phu-kien': { label: 'Phụ kiện', heroImage: '/mega_menu_phukien.png', apiCategory: 'phu-kien' },
};

// ─── Filter config (module-level constant — never re-created) ─────────────────
const FILTER_CONFIG = [
  {
    key: 'category',
    label: 'Danh mục',
    options: [
      { value: 'ao', label: 'Áo' },
      { value: 'quan', label: 'Quần' },
      { value: 'phu-kien', label: 'Phụ kiện' },
    ],
  },
  {
    key: 'size',
    label: 'Kích cỡ',
    options: [
      { value: 'XS', label: 'XS' },
      { value: 'S', label: 'S' },
      { value: 'M', label: 'M' },
      { value: 'L', label: 'L' },
      { value: 'XL', label: 'XL' },
      { value: 'XXL', label: 'XXL' },
    ],
  },
  {
    key: 'collection',
    label: 'Bộ sưu tập',
    options: [
      { value: 'LEGACY', label: 'LEGACY' },
      { value: 'STUDIO', label: 'STUDIO' },
      { value: 'GS POWER', label: 'GS POWER' },
      { value: 'EVERYDAY', label: 'EVERYDAY' },
      { value: 'VITAL', label: 'VITAL' },
    ],
  },
  {
    key: 'price',
    label: 'Giá',
    options: [
      { value: 'under300', label: 'Dưới 300K' },
      { value: '300to700', label: '300K – 700K' },
      { value: 'above700', label: 'Trên 700K' },
    ],
  },
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Nổi bật nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá thấp đến cao' },
  { value: 'price_desc', label: 'Giá cao đến thấp' },
];

const EMPTY_FILTERS = { category: null, size: null, collection: null, price: null };

// ─── Pure helpers (module-level, never re-created) ────────────────────────────
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function getFirstImage(item) {
  if (item.productVariants && item.productVariants.length > 0) {
    const urls = [...new Set(item.productVariants.map((v) => v.imageUrl))];
    if (urls[0]) return urls[0];
  }
  return 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&q=80';
}

function priceInRange(price, rangeKey) {
  if (!rangeKey) return true;
  if (rangeKey === 'under300') return price < 300000;
  if (rangeKey === '300to700') return price >= 300000 && price <= 700000;
  if (rangeKey === 'above700') return price > 700000;
  return true;
}

function applyFiltersAndSort(allProducts, filters, sort) {
  let list = allProducts.slice(); // shallow copy, never mutate source

  if (filters.category) {
    list = list.filter((p) => {
      const cat = ((p.category || p.type) ?? '').toLowerCase();
      const name = (p.name ?? '').toLowerCase();
      if (filters.category === 'ao') {
        return cat.includes('ao') || cat.includes('shirt') || cat.includes('top') || cat.includes('hoodie')
          || name.includes('áo') || name.includes('hoodie') || name.includes('tank') || name.includes('bra');
      }
      if (filters.category === 'quan') {
        return cat.includes('quan') || cat.includes('short') || cat.includes('jogger') || cat.includes('legging')
          || name.includes('quần') || name.includes('short') || name.includes('jogger') || name.includes('legging');
      }
      if (filters.category === 'phu-kien') {
        return cat.includes('phu') || cat.includes('bag') || cat.includes('balo')
          || name.includes('bag') || name.includes('túi') || name.includes('balo') || name.includes('găng') || name.includes('đai') || name.includes('vớ');
      }
      return true;
    });
  }

  if (filters.size) {
    list = list.filter((p) => {
      const sizes = (p.productVariants || []).map((v) => (v.size || '').toUpperCase());
      return sizes.includes(filters.size);
    });
  }

  if (filters.collection) {
    list = list.filter((p) =>
      ((p.collection || '')).toUpperCase().includes(filters.collection.toUpperCase())
    );
  }

  if (filters.price) {
    list = list.filter((p) => priceInRange(p.price, filters.price));
  }

  if (sort === 'newest') {
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } else if (sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  }

  return list;
}

// ─── CollectionHero ───────────────────────────────────────────────────────────
function CollectionHero({ meta }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
      <img
        src={meta.heroImage}
        alt={meta.label + ' banner'}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.56) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <h1 style={{
          fontFamily: "'Roboto','Helvetica',Arial,sans-serif",
          fontSize: '32px', fontWeight: 700,
          color: '#ffffff', textTransform: 'uppercase',
          letterSpacing: '4px', margin: 0,
          textShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}>
          {meta.label.toUpperCase()}
        </h1>
      </div>
    </div>
  );
}

// ─── SimpleBreadcrumb ─────────────────────────────────────────────────────────
function SimpleBreadcrumb({ label }) {
  return (
    <div style={{
      padding: '12px 48px',
      borderBottom: '1px solid #f0f0f0',
      display: 'flex', alignItems: 'center', gap: '6px',
      fontFamily: "'Roboto','Helvetica',Arial,sans-serif",
      fontSize: '12px',
    }}>
      <Link to="/" style={{ color: '#6e6e6e', textDecoration: 'none' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#1b1b1b')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#6e6e6e')}
      >
        Trang chủ
      </Link>
      <span style={{ color: '#b0b0b0' }}>›</span>
      <span style={{ color: '#1b1b1b', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

// ─── FilterSortBar ────────────────────────────────────────────────────────────
function FilterSortBar({ filters, onFilterChange, sort, onSortChange }) {
  return (
    <div
      id="filter-sort-bar"
      style={{
        position: 'sticky',
        top: '76px',
        zIndex: 90,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e5e5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '10px 48px',
      }}
    >
      {/* Left: filter dropdowns */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {FILTER_CONFIG.map((fc) => (
          <Select
            key={fc.key}
            id={'filter-' + fc.key}
            placeholder={fc.label}
            allowClear
            value={filters[fc.key] || undefined}
            onChange={(val) => onFilterChange(fc.key, val || null)}
            onClear={() => onFilterChange(fc.key, null)}
            style={{ minWidth: 130 }}
            popupMatchSelectWidth={false}
            aria-label={fc.label}
          >
            {fc.options.map((opt) => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
        ))}
      </div>

      {/* Right: sort */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontFamily: "'Roboto','Helvetica',Arial,sans-serif",
          fontSize: '13px', color: '#6e6e6e',
        }}>
          Sắp xếp:
        </span>
        <Select
          id="sort-select"
          value={sort}
          onChange={onSortChange}
          style={{ minWidth: 190 }}
          popupMatchSelectWidth={false}
          aria-label="Sắp xếp sản phẩm"
        >
          {SORT_OPTIONS.map((opt) => (
            <Option key={opt.value} value={opt.value}>{opt.label}</Option>
          ))}
        </Select>
      </div>
    </div>
  );
}

// ─── ActiveFilterChips ────────────────────────────────────────────────────────
function ActiveFilterChips({ filters, onRemoveFilter, onClearAll }) {
  const chips = [];
  FILTER_CONFIG.forEach((fc) => {
    if (filters[fc.key]) {
      const opt = fc.options.find((o) => o.value === filters[fc.key]);
      chips.push({ key: fc.key, filterLabel: fc.label, valueLabel: opt ? opt.label : filters[fc.key] });
    }
  });

  if (chips.length === 0) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', flexWrap: 'wrap',
      gap: '8px', padding: '10px 48px',
      borderBottom: '1px solid #f0f0f0',
      backgroundColor: '#fafafa',
    }}>
      {chips.map((chip) => (
        <span key={chip.key} style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          backgroundColor: '#1b1b1b', color: '#ffffff',
          fontSize: '12px', fontFamily: "'Roboto','Helvetica',Arial,sans-serif",
          padding: '3px 10px', borderRadius: '2px',
        }}>
          <span>{chip.filterLabel}: {chip.valueLabel}</span>
          <button
            type="button"
            aria-label={'Xóa bộ lọc ' + chip.filterLabel + ': ' + chip.valueLabel}
            onClick={() => onRemoveFilter(chip.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#ffffff', padding: '0', lineHeight: 1,
              display: 'flex', alignItems: 'center',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        style={{
          background: 'none', border: '1px solid #1b1b1b',
          cursor: 'pointer', padding: '3px 12px',
          fontSize: '12px', fontFamily: "'Roboto','Helvetica',Arial,sans-serif",
          color: '#1b1b1b', borderRadius: '2px',
          transition: 'background 125ms, color 125ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#1b1b1b'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#1b1b1b'; }}
      >
        Xóa bộ lọc
      </button>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState({ onClear }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '80px 24px', textAlign: 'center',
      }}
    >
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none"
        style={{ marginBottom: '20px', opacity: 0.2 }} aria-hidden="true">
        <rect x="6" y="6" width="36" height="36" rx="4" stroke="#1b1b1b" strokeWidth="2" />
        <path d="M16 24h16M24 16v16" stroke="#1b1b1b" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p style={{
        fontFamily: "'Roboto','Helvetica',Arial,sans-serif",
        fontSize: '16px', fontWeight: 600, color: '#1b1b1b', margin: '0 0 8px',
      }}>
        Không tìm thấy sản phẩm phù hợp
      </p>
      <p style={{
        fontFamily: "'Roboto','Helvetica',Arial,sans-serif",
        fontSize: '13px', color: '#6e6e6e', margin: '0 0 24px',
      }}>
        Thử thay đổi bộ lọc hoặc xem tất cả sản phẩm
      </p>
      <button
        type="button"
        onClick={onClear}
        style={{
          backgroundColor: '#1b1b1b', color: '#ffffff',
          border: 'none', cursor: 'pointer',
          padding: '12px 32px',
          fontFamily: "'Roboto','Helvetica',Arial,sans-serif",
          fontSize: '13px', fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#000')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1b1b1b')}
      >
        Xóa bộ lọc
      </button>
    </div>
  );
}

// ─── Error Boundary ───────────────────────────────────────────────────────────
class CollectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Unknown error' };
  }
  componentDidCatch(error, info) {
    console.error('[CollectionPage] Error:', error, info);
  }
  handleReset() {
    this.setState({ hasError: false, errorMessage: '' });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '80px 48px', textAlign: 'center',
          fontFamily: "'Roboto','Helvetica',Arial,sans-serif",
        }}>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#1b1b1b', marginBottom: '8px' }}>
            Có lỗi xảy ra khi tải trang
          </p>
          <p style={{ fontSize: '13px', color: '#6e6e6e', marginBottom: '24px' }}>
            {this.state.errorMessage}
          </p>
          <button
            onClick={() => this.handleReset()}
            style={{
              backgroundColor: '#1b1b1b', color: '#fff',
              border: 'none', padding: '10px 28px',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            }}
          >
            Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Main CollectionPage ──────────────────────────────────────────────────────
function CollectionPageInner() {
  const { '*': slugPath } = useParams();
  const slug = (slugPath || '').split('/')[0] || 'nam';
  const meta = CATEGORY_META[slug] || CATEGORY_META['nam'];

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);

  const gridTopRef = useRef(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setAllProducts([]);
    setCurrentPage(1);
    setFilters(EMPTY_FILTERS);

    async function load() {
      try {
        // Try category-scoped endpoint first
        const r1 = await fetch(API_BASE + '?pageSize=200&category=' + meta.apiCategory);
        if (!cancelled) {
          if (r1.ok) {
            const d = await r1.json();
            setAllProducts(d.items ?? (Array.isArray(d) ? d : []));
          } else {
            // Fallback: fetch all
            const r2 = await fetch(API_BASE + '?pageSize=200');
            if (!cancelled && r2.ok) {
              const d = await r2.json();
              setAllProducts(d.items ?? (Array.isArray(d) ? d : []));
            }
          }
        }
      } catch (err) {
        console.error('CollectionPage fetch error:', err);
        if (!cancelled) setAllProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Client-side filter + sort (memoized) ──────────────────────────────────
  const processedProducts = useMemo(
    () => applyFiltersAndSort(allProducts, filters, sort),
    [allProducts, filters, sort]
  );

  // ── Paginated slice ────────────────────────────────────────────────────────
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return processedProducts.slice(start, start + PAGE_SIZE);
  }, [processedProducts, currentPage]);

  // ── Stable callbacks ───────────────────────────────────────────────────────
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => {
      const next = Object.assign({}, prev);
      next[key] = value;
      return next;
    });
    setCurrentPage(1);
  }, []);

  const handleRemoveFilter = useCallback((key) => {
    setFilters((prev) => {
      const next = Object.assign({}, prev);
      next[key] = null;
      return next;
    });
    setCurrentPage(1);
  }, []);

  const handleClearAll = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((val) => {
    setSort(val);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const hasActiveFilters = Object.values(filters).some(Boolean);
  const totalCount = processedProducts.length;
  const displayedCount = paginatedProducts.length;

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

      {/* 1. Hero */}
      <CollectionHero meta={meta} />

      {/* 2. Breadcrumb */}
      <SimpleBreadcrumb label={meta.label} />

      {/* 3. Filter / Sort bar */}
      <FilterSortBar
        filters={filters}
        onFilterChange={handleFilterChange}
        sort={sort}
        onSortChange={handleSortChange}
      />

      {/* 4. Active filter chips */}
      {hasActiveFilters && (
        <ActiveFilterChips
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAll}
        />
      )}

      {/* 5. Content */}
      <div ref={gridTopRef} style={{ padding: '32px 48px 80px' }}>

        {/* Product count */}
        {!loading && (
          <p
            id="product-count"
            aria-live="polite"
            aria-atomic="true"
            style={{
              fontFamily: "'Roboto','Helvetica',Arial,sans-serif",
              fontSize: '12px', color: '#6e6e6e', marginBottom: '20px',
            }}
          >
            {totalCount === 0
              ? 'Không có sản phẩm'
              : 'Hiển thị ' + displayedCount + '/' + totalCount + ' sản phẩm'}
          </p>
        )}

        {/* Loading — 8 skeletons */}
        {loading && (
          <ProductGrid>
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCard key={'skel-' + i} isLoading />
            ))}
          </ProductGrid>
        )}

        {/* Empty state */}
        {!loading && processedProducts.length === 0 && (
          <EmptyState onClear={handleClearAll} />
        )}

        {/* Product grid */}
        {!loading && processedProducts.length > 0 && (
          <ProductGrid>
            {paginatedProducts.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                slug={item.slug || String(item.id)}
                image={getFirstImage(item)}
                productName={item.name}
                collectionName={item.collection ? item.collection.toUpperCase() : meta.label.toUpperCase()}
                price={formatPrice(item.price)}
                isOutOfStock={item.stock === 0 || item.isOutOfStock === true}
              />
            ))}
          </ProductGrid>
        )}

        {/* Pagination */}
        {!loading && totalCount > PAGE_SIZE && (
          <div
            style={{ display: 'flex', justifyContent: 'center', marginTop: '56px' }}
            aria-label="Phân trang sản phẩm"
          >
            <Pagination
              current={currentPage}
              total={totalCount}
              pageSize={PAGE_SIZE}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollectionPage() {
  return (
    <CollectionErrorBoundary>
      <CollectionPageInner />
    </CollectionErrorBoundary>
  );
}
