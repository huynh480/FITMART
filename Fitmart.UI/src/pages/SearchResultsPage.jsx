import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ProductCard, ProductGrid } from '../components/ProductCard';
import { productsApi, API_BASE } from '../services/api';

const PAGE_SIZE = 24;
const FONT = "'Roboto','Helvetica',Arial,sans-serif";

/**
 * Format giá VND
 */
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

/**
 * Lấy ảnh đầu tiên từ productVariants
 */
function getFirstImage(item) {
  const variants = item.productVariants || [];
  if (variants.length > 0) {
    const urls = [...new Set(variants.map((v) => v.imageUrl))].filter(Boolean);
    if (urls[0]) return urls[0];
  }
  return 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&q=80';
}

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState('newest');

  const gridRef = useRef(null);

  // Fetch products based on search query
  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setTotalItems(0);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setCurrentPage(1);

    productsApi
      .searchFull({ search: query.trim(), page: 1, pageSize: 200 })
      .then((data) => {
        if (!cancelled) {
          setProducts(data.items || []);
          setTotalItems(data.totalItems || 0);
        }
      })
      .catch((err) => {
        console.error('Search error:', err);
        if (!cancelled) {
          setProducts([]);
          setTotalItems(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [query]);

  // Sort products
  const sorted = useMemo(() => {
    const list = [...products];
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => b.id - a.id); // newest
    return list;
  }, [products, sort]);

  // Paginate
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, currentPage]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Search Results Header */}
      <div
        style={{
          padding: '48px 48px 32px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px',
          }}
        >
          <SearchOutlined style={{ fontSize: '20px', color: '#6e6e6e' }} />
          <h1
            style={{
              fontFamily: FONT,
              fontSize: '28px',
              fontWeight: 700,
              color: '#1b1b1b',
              margin: 0,
              letterSpacing: '-0.5px',
            }}
          >
            Kết quả tìm kiếm
          </h1>
        </div>
        <p
          style={{
            fontFamily: FONT,
            fontSize: '14px',
            color: '#6e6e6e',
            margin: '6px 0 0',
          }}
        >
          {loading
            ? 'Đang tìm kiếm...'
            : totalItems > 0
            ? <>Tìm thấy <strong style={{ color: '#1b1b1b' }}>{totalItems}</strong> sản phẩm cho "<strong style={{ color: '#1b1b1b' }}>{query}</strong>"</>
            : query
            ? <>Không tìm thấy sản phẩm nào cho "<strong style={{ color: '#1b1b1b' }}>{query}</strong>"</>
            : 'Nhập từ khóa để tìm kiếm sản phẩm'}
        </p>
      </div>

      {/* Sort + Product Count Bar */}
      {!loading && products.length > 0 && (
        <div
          style={{
            padding: '16px 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f8f8f8',
          }}
        >
          <p
            aria-live="polite"
            style={{
              fontFamily: FONT,
              fontSize: '12px',
              color: '#6e6e6e',
              margin: 0,
            }}
          >
            Hiển thị {paginated.length}/{sorted.length} sản phẩm
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label
              htmlFor="search-sort"
              style={{
                fontFamily: FONT,
                fontSize: '12px',
                color: '#6e6e6e',
              }}
            >
              Sắp xếp:
            </label>
            <select
              id="search-sort"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }}
              style={{
                fontFamily: FONT,
                fontSize: '13px',
                color: '#1b1b1b',
                border: '1px solid #e5e5e5',
                borderRadius: '4px',
                padding: '6px 12px',
                cursor: 'pointer',
                backgroundColor: '#fff',
                outline: 'none',
              }}
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div ref={gridRef} style={{ padding: '32px 48px 80px' }}>
        {/* Loading */}
        {loading && (
          <ProductGrid>
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCard key={`sk-${i}`} isLoading />
            ))}
          </ProductGrid>
        )}

        {/* No results */}
        {!loading && query && products.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: '#f7f7f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <SearchOutlined style={{ fontSize: '28px', color: '#bfbfbf' }} />
            </div>
            <p
              style={{
                fontFamily: FONT,
                fontSize: '16px',
                fontWeight: 600,
                color: '#1b1b1b',
                margin: '0 0 8px',
              }}
            >
              Không tìm thấy sản phẩm phù hợp
            </p>
            <p
              style={{
                fontFamily: FONT,
                fontSize: '14px',
                color: '#6e6e6e',
                margin: '0 0 24px',
                maxWidth: '400px',
                lineHeight: '1.6',
              }}
            >
              Hãy thử tìm kiếm với từ khóa khác hoặc duyệt qua các danh mục sản phẩm của chúng tôi.
            </p>
          </div>
        )}

        {/* Products */}
        {!loading && paginated.length > 0 && (
          <ProductGrid>
            {paginated.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                slug={item.slug || String(item.id)}
                image={getFirstImage(item)}
                productName={item.name}
                collectionName={item.collection ? item.collection.toUpperCase() : (item.category?.name || 'FITMART')}
                price={formatPrice(item.price)}
                isOutOfStock={item.stock === 0 || item.isOutOfStock === true}
                product={item}
              />
            ))}
          </ProductGrid>
        )}

        {/* Pagination */}
        {!loading && sorted.length > PAGE_SIZE && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '56px' }}>
            <Pagination
              current={currentPage}
              total={sorted.length}
              pageSize={PAGE_SIZE}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
