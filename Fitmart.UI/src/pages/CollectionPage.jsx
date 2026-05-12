import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Pagination } from 'antd';
import { ProductCard, ProductGrid } from '../components/ProductCard';
import CollectionHero from '../components/ui/CollectionHero';
import FilterSidebar from '../components/ui/FilterSidebar';
import { getCollectionConfig } from '../config/collectionConfig';

const PAGE_SIZE = 24;
const API_BASE = 'http://localhost:5049/api/Products';
const FONT = "'Roboto','Helvetica',Arial,sans-serif";

// ─── Filter state shape ───────────────────────────────────────────────────────
// category, size, collection — Sets (multi-select)
// price — string | null  (single-select radio)
// sort  — string
function emptyFilters() {
  return { category: new Set(), size: new Set(), collection: new Set(), price: null };
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function getFirstImage(item) {
  const variants = item.productVariants || [];
  if (variants.length > 0) {
    const urls = [...new Set(variants.map((v) => v.imageUrl))].filter(Boolean);
    if (urls[0]) return urls[0];
  }
  return 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&q=80';
}

function priceInRange(price, key) {
  if (!key) return true;
  if (key === 'under300') return price < 300000;
  if (key === '300to700') return price >= 300000 && price <= 700000;
  if (key === 'above700') return price > 700000;
  return true;
}

function applyFilters(list, filters, sort) {
  let out = list.slice();

  // Category — multi-select, OR within set
  if (filters.category.size > 0) {
    out = out.filter((p) => {
      // Defensive coercion: API may return arrays/objects for category
      const rawCat = p.category || p.type;
      const cat = (rawCat != null && typeof rawCat !== 'object' ? String(rawCat) : '').toLowerCase();
      const name = (p.name != null ? String(p.name) : '').toLowerCase();
      for (const sel of filters.category) {
        const s = sel.toLowerCase();
        if (cat.includes(s) || name.includes(s)) return true;
        if (s === 'áo' && (cat.includes('ao') || name.includes('áo') || name.includes('shirt') || name.includes('top') || name.includes('hoodie') || name.includes('bra'))) return true;
        if (s === 'quần' && (cat.includes('quan') || name.includes('quần') || name.includes('short') || name.includes('jogger') || name.includes('legging'))) return true;
      }
      return false;
    });
  }

  // Size — multi-select, OR within set
  if (filters.size.size > 0) {
    out = out.filter((p) => {
      const sizes = (p.productVariants || []).map((v) => (v.size || '').toUpperCase());
      for (const sz of filters.size) {
        if (sizes.includes(sz)) return true;
      }
      return false;
    });
  }

  // Collection — multi-select
  if (filters.collection.size > 0) {
    out = out.filter((p) => {
      const col = (p.collection ?? '').toUpperCase();
      for (const sel of filters.collection) {
        if (col.includes(sel.toUpperCase())) return true;
      }
      return false;
    });
  }

  // Price — single
  if (filters.price) {
    out = out.filter((p) => priceInRange(p.price, filters.price));
  }

  // Sort
  if (sort === 'newest') out.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  else if (sort === 'price_asc') out.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') out.sort((a, b) => b.price - a.price);

  return out;
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onClear }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ marginBottom: '16px', opacity: 0.2 }} aria-hidden="true">
        <rect x="5" y="5" width="30" height="30" rx="3" stroke="#1b1b1b" strokeWidth="2" />
        <path d="M13 20h14M20 13v14" stroke="#1b1b1b" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p style={{ fontFamily: FONT, fontSize: '15px', fontWeight: 600, color: '#1b1b1b', margin: '0 0 6px' }}>Không tìm thấy sản phẩm phù hợp</p>
      <p style={{ fontFamily: FONT, fontSize: '13px', color: '#6e6e6e', margin: '0 0 20px' }}>Thử thay đổi bộ lọc hoặc xóa tất cả</p>
      <button type="button" onClick={onClear} style={{ backgroundColor: '#1b1b1b', color: '#fff', border: 'none', cursor: 'pointer', padding: '10px 28px', fontFamily: FONT, fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Xóa bộ lọc
      </button>
    </div>
  );
}

// ─── Error boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  state = { err: null };
  static getDerivedStateFromError(e) { return { err: e }; }
  componentDidCatch(e, info) { console.error('[CollectionPage]', e, info); }
  render() {
    if (this.state.err) {
      return (
        <div style={{ padding: '60px', textAlign: 'center', fontFamily: FONT }}>
          <p style={{ fontSize: '15px', color: '#1b1b1b', marginBottom: '8px' }}>Có lỗi xảy ra</p>
          <p style={{ fontSize: '13px', color: '#6e6e6e' }}>{this.state.err.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Main page ────────────────────────────────────────────────────────────────
function CollectionPageInner() {
  const { '*': slugPath } = useParams();
  const slug = (slugPath || '').replace(/^\//, '');
  const config = getCollectionConfig(slug || 'nam');

  // Derive parentSlug (top-level segment before first slash)
  const parentSlug = slug.includes('/') ? slug.split('/')[0] : null;

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(emptyFilters);
  const [sort, setSort] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);

  const gridRef = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setAllProducts([]);
    setFilters(emptyFilters());
    setSort('featured');
    setCurrentPage(1);

    async function load() {
      try {
        const r = await fetch(`${API_BASE}?pageSize=200&category=${config.apiCategory}`);
        const d = await r.json();
        if (!cancelled) setAllProducts(d.items ?? (Array.isArray(d) ? d : []));
      } catch {
        try {
          const r2 = await fetch(`${API_BASE}?pageSize=200`);
          const d2 = await r2.json();
          if (!cancelled) setAllProducts(d2.items ?? (Array.isArray(d2) ? d2 : []));
        } catch {
          if (!cancelled) setAllProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [slug]); // eslint-disable-line

  // ── Processed list ─────────────────────────────────────────────────────────
  const processed = useMemo(
    () => applyFilters(allProducts, filters, sort),
    [allProducts, filters, sort]
  );
  const paginated = useMemo(() => {
    const s = (currentPage - 1) * PAGE_SIZE;
    return processed.slice(s, s + PAGE_SIZE);
  }, [processed, currentPage]);

  // ── Callbacks ──────────────────────────────────────────────────────────────
  const handleFilterChange = useCallback((type, value) => {
    setFilters((prev) => {
      const next = { ...prev, category: new Set(prev.category), size: new Set(prev.size), collection: new Set(prev.collection) };
      if (type === 'price') {
        next.price = value; // single-select: value is new string or null
      } else {
        const s = next[type];
        if (s.has(value)) s.delete(value); else s.add(value);
      }
      return next;
    });
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((val) => {
    setSort(val);
    setCurrentPage(1);
  }, []);

  const handleClearAll = useCallback(() => {
    setFilters(emptyFilters());
    setSort('featured');
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const hasActive = filters.category.size > 0 || filters.size.size > 0 || filters.collection.size > 0 || !!filters.price;

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Hero — text-only, inside page padding */}
      <div style={{ padding: '0 48px' }}>
        <CollectionHero
          config={config}
          productCount={loading ? 0 : allProducts.length}
          parentSlug={parentSlug}
        />
      </div>

      {/* 2-column layout */}
      <div style={{ display: 'flex', gap: '0', padding: '32px 48px 80px', alignItems: 'flex-start' }}>

        {/* LEFT: Sidebar */}
        <FilterSidebar
          config={config}
          filters={filters}
          sort={sort}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onClearAll={handleClearAll}
          hasActiveFilters={hasActive}
        />

        {/* RIGHT: Grid */}
        <div ref={gridRef} style={{ flex: 1, minWidth: 0, paddingLeft: '36px' }}>
          {/* Count bar */}
          {!loading && (
            <p aria-live="polite" aria-atomic="true" style={{ fontFamily: FONT, fontSize: '12px', color: '#6e6e6e', marginBottom: '20px', marginTop: '0' }}>
              {processed.length === 0
                ? 'Không có sản phẩm'
                : `Hiển thị ${paginated.length}/${processed.length} sản phẩm`}
            </p>
          )}

          {/* Loading skeletons */}
          {loading && (
            <ProductGrid>
              {Array.from({ length: 8 }).map((_, i) => <ProductCard key={`sk-${i}`} isLoading />)}
            </ProductGrid>
          )}

          {/* Empty state */}
          {!loading && processed.length === 0 && <EmptyState onClear={handleClearAll} />}

          {/* Products */}
          {!loading && processed.length > 0 && (
            <ProductGrid>
              {paginated.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  slug={item.slug || String(item.id)}
                  image={getFirstImage(item)}
                  productName={item.name}
                  collectionName={item.collection ? item.collection.toUpperCase() : config.name}
                  price={formatPrice(item.price)}
                  isOutOfStock={item.stock === 0 || item.isOutOfStock === true}
                />
              ))}
            </ProductGrid>
          )}

          {/* Pagination */}
          {!loading && processed.length > PAGE_SIZE && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '56px' }}>
              <Pagination
                current={currentPage}
                total={processed.length}
                pageSize={PAGE_SIZE}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CollectionPage() {
  return <ErrorBoundary><CollectionPageInner /></ErrorBoundary>;
}
