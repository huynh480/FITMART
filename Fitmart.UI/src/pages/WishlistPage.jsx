import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductCard, ProductGrid } from '../components/ProductCard';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../hooks/useWishlist';
import { wishlistApi, API_BASE } from '../services/api';

const FONT = "'Roboto','Helvetica',Arial,sans-serif";

/* ─── Helper ─────────────────────────────────────────────────────── */
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function getFirstImage(product) {
  const variants = product.productVariants || [];
  if (variants.length > 0) {
    const urls = [...new Set(variants.map((v) => v.imageUrl))].filter(Boolean);
    if (urls[0]) return urls[0];
  }
  const images = product.productImages || [];
  if (images.length > 0 && images[0].imageUrl) return images[0].imageUrl;
  return 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&q=80';
}

/* ─── Empty State — khi danh sách trống ─────────────────────────── */
function EmptyWishlist() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px 120px',
        textAlign: 'center',
      }}
    >
      {/* Heart icon */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: '#f7f7f7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="#1b1b1b"
          style={{ width: 36, height: 36, opacity: 0.3 }}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </div>

      <p
        style={{
          fontFamily: FONT,
          fontSize: 16,
          fontWeight: 600,
          color: '#1b1b1b',
          margin: '0 0 8px',
          letterSpacing: '0.02em',
        }}
      >
        Chưa có sản phẩm yêu thích
      </p>
      <p
        style={{
          fontFamily: FONT,
          fontSize: 14,
          color: '#6e6e6e',
          margin: '0 0 32px',
          maxWidth: 360,
          lineHeight: 1.5,
        }}
      >
        Nhấn vào biểu tượng trái tim trên sản phẩm để thêm vào danh sách yêu thích
      </p>

      <Link
        to="/collections/nam"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#1b1b1b',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer',
          padding: '14px 36px',
          fontFamily: FONT,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          transition: 'background-color 200ms ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#000000')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1b1b1b')}
      >
        KHÁM PHÁ NGAY
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
}

/* ─── Unauthenticated State ─────────────────────────────────────── */
function LoginPrompt() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px 120px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: '#f7f7f7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="#1b1b1b"
          style={{ width: 36, height: 36, opacity: 0.3 }}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      </div>

      <p
        style={{
          fontFamily: FONT,
          fontSize: 16,
          fontWeight: 600,
          color: '#1b1b1b',
          margin: '0 0 8px',
        }}
      >
        Đăng nhập để xem sản phẩm yêu thích
      </p>
      <p
        style={{
          fontFamily: FONT,
          fontSize: 14,
          color: '#6e6e6e',
          margin: '0 0 32px',
          maxWidth: 360,
          lineHeight: 1.5,
        }}
      >
        Vui lòng đăng nhập hoặc tạo tài khoản để lưu và quản lý danh sách yêu thích
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#1b1b1b',
            color: '#ffffff',
            padding: '14px 36px',
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'background-color 200ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#000000')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1b1b1b')}
        >
          ĐĂNG NHẬP
        </Link>
        <Link
          to="/register"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            color: '#1b1b1b',
            padding: '14px 36px',
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            border: '1px solid #1b1b1b',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1b1b1b';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.color = '#1b1b1b';
          }}
        >
          TẠO TÀI KHOẢN
        </Link>
      </div>
    </div>
  );
}

/* ─── Loading Skeleton ──────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <ProductGrid>
      {Array.from({ length: 4 }).map((_, i) => (
        <ProductCard key={`wl-sk-${i}`} isLoading />
      ))}
    </ProductGrid>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   WishlistPage — Main
   ═══════════════════════════════════════════════════════════════════ */
export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { wishlistCount } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch full wishlist data whenever the page mounts or wishlistCount changes
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    wishlistApi.getAll()
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setProducts(data.map((item) => item.product));
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải wishlist:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isAuthenticated, wishlistCount]);

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
        <WishlistHeader count={0} />
        <LoginPrompt />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <WishlistHeader count={wishlistCount} />

      <div style={{ padding: '0 48px 80px', maxWidth: 1400, margin: '0 auto' }}>
        {loading && <LoadingSkeleton />}

        {!loading && products.length === 0 && <EmptyWishlist />}

        {!loading && products.length > 0 && (
          <>
            {/* Count bar */}
            <p
              aria-live="polite"
              aria-atomic="true"
              style={{
                fontFamily: FONT,
                fontSize: 12,
                color: '#6e6e6e',
                marginBottom: 20,
                marginTop: 0,
              }}
            >
              {products.length} sản phẩm
            </p>

            <ProductGrid>
              {products.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  slug={item.slug || String(item.id)}
                  image={getFirstImage(item)}
                  productName={item.name}
                  collectionName={
                    item.collection
                      ? item.collection.toUpperCase()
                      : item.category?.name?.toUpperCase() || 'FITMART'
                  }
                  price={formatPrice(item.price)}
                  isOutOfStock={item.stock === 0 || item.isOutOfStock === true}
                  product={item}
                />
              ))}
            </ProductGrid>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Header Section ────────────────────────────────────────────── */
function WishlistHeader({ count }) {
  return (
    <div
      style={{
        padding: '48px 48px 32px',
        maxWidth: 1400,
        margin: '0 auto',
      }}
    >
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        style={{
          fontFamily: FONT,
          fontSize: 12,
          color: '#6e6e6e',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Link
          to="/"
          style={{
            color: '#6e6e6e',
            textDecoration: 'none',
            transition: 'color 200ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#1b1b1b')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6e6e6e')}
        >
          Trang chủ
        </Link>
        <span aria-hidden="true" style={{ opacity: 0.4 }}>/</span>
        <span style={{ color: '#1b1b1b', fontWeight: 500 }}>Yêu thích</span>
      </nav>

      {/* Title row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 12,
        }}
      >
        <h1
          style={{
            fontFamily: FONT,
            fontSize: 28,
            fontWeight: 700,
            color: '#1b1b1b',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Sản phẩm yêu thích
        </h1>
        {count > 0 && (
          <span
            style={{
              fontFamily: FONT,
              fontSize: 14,
              color: '#6e6e6e',
              fontWeight: 400,
            }}
          >
            ({count})
          </span>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          width: '100%',
          height: 1,
          backgroundColor: '#e5e5e5',
          marginTop: 24,
        }}
      />
    </div>
  );
}
