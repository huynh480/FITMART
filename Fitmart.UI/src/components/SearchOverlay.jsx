import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchOutlined, CloseOutlined, LoadingOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { productsApi, API_BASE } from '../services/api';

const FONT = "'Roboto','Helvetica',Arial,sans-serif";
const DEBOUNCE_MS = 350;

/**
 * Lấy ảnh đầu tiên từ productVariants
 */
function getFirstImage(product) {
  const variants = product.productVariants || [];
  if (variants.length > 0) {
    const urls = [...new Set(variants.map((v) => v.imageUrl))].filter(Boolean);
    if (urls[0]) return urls[0];
  }
  return null;
}

/**
 * Format giá VND
 */
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

/**
 * Resolve ảnh URL (thêm base nếu cần)
 */
function resolveImageUrl(url) {
  if (!url) return 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=200&q=60';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

// ─── Search Overlay ──────────────────────────────────────────────────────────
const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const overlayRef = useRef(null);
  const navigate = useNavigate();

  // Auto-focus input when overlay opens
  useEffect(() => {
    if (isOpen) {
      // Small delay for animation
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Reset state when overlay closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setTotalItems(0);
      setLoading(false);
      setActiveIndex(-1);
      setHasSearched(false);
    }
  }, [isOpen]);

  // Debounced search
  const performSearch = useCallback((q) => {
    clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setResults([]);
      setTotalItems(0);
      setLoading(false);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await productsApi.search(q.trim(), 8);
        setResults(data.items || []);
        setTotalItems(data.totalItems || 0);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIndex(-1);
    performSearch(val);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setTotalItems(0);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  // Navigate to full search results page
  const handleViewAll = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  // Navigate to product detail
  const handleProductClick = () => {
    onClose();
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < results.length) {
        navigate(`/products/${results[activeIndex].id}`);
        onClose();
      } else {
        handleViewAll();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Tìm kiếm sản phẩm"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'searchOverlayFadeIn 250ms ease-out',
      }}
    >
      {/* Search Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '740px',
          marginTop: '80px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25), 0 4px 20px rgba(0, 0, 0, 0.12)',
          overflow: 'hidden',
          animation: 'searchSlideDown 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          maxHeight: 'calc(100vh - 120px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid #f0f0f0',
            gap: '14px',
          }}
        >
          <SearchOutlined
            style={{
              fontSize: '20px',
              color: loading ? '#bfbfbf' : '#1b1b1b',
              flexShrink: 0,
              transition: 'color 200ms',
            }}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Tìm kiếm sản phẩm..."
            autoComplete="off"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '17px',
              fontFamily: FONT,
              fontWeight: 400,
              color: '#1b1b1b',
              backgroundColor: 'transparent',
              caretColor: '#1b1b1b',
              letterSpacing: '0.2px',
            }}
          />
          {loading && (
            <LoadingOutlined
              style={{
                fontSize: '18px',
                color: '#bfbfbf',
                flexShrink: 0,
                animation: 'spin 1s linear infinite',
              }}
            />
          )}
          {query && !loading && (
            <button
              onClick={handleClear}
              aria-label="Xóa từ khóa"
              style={{
                background: '#f5f5f5',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                color: '#6e6e6e',
                flexShrink: 0,
                transition: 'all 150ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e8e8e8'; e.currentTarget.style.color = '#1b1b1b'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#6e6e6e'; }}
            >
              <CloseOutlined style={{ fontSize: '12px' }} />
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Đóng tìm kiếm"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 0 6px 10px',
              fontFamily: FONT,
              fontSize: '13px',
              fontWeight: 500,
              color: '#6e6e6e',
              flexShrink: 0,
              borderLeft: '1px solid #e8e8e8',
              transition: 'color 150ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1b1b1b'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6e6e6e'; }}
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div
          style={{
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {/* No query — show hint */}
          {!query && (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#f7f7f7',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <SearchOutlined style={{ fontSize: '24px', color: '#bfbfbf' }} />
              </div>
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: '14px',
                  color: '#6e6e6e',
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                Nhập từ khóa để tìm kiếm sản phẩm
              </p>
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: '12px',
                  color: '#b0b0b0',
                  margin: '6px 0 0',
                }}
              >
                Sử dụng ↑ ↓ để di chuyển, Enter để chọn
              </p>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && query && (
            <div style={{ padding: '16px 24px' }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px 0',
                    borderBottom: i < 3 ? '1px solid #f8f8f8' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '70px',
                      borderRadius: '6px',
                      backgroundColor: '#f5f5f5',
                      flexShrink: 0,
                      animation: 'shimmer 1.5s ease-in-out infinite',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        width: '60%',
                        height: '14px',
                        borderRadius: '4px',
                        backgroundColor: '#f5f5f5',
                        marginBottom: '8px',
                        animation: 'shimmer 1.5s ease-in-out infinite',
                      }}
                    />
                    <div
                      style={{
                        width: '30%',
                        height: '12px',
                        borderRadius: '4px',
                        backgroundColor: '#f5f5f5',
                        animation: 'shimmer 1.5s ease-in-out infinite',
                        animationDelay: '0.3s',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && hasSearched && query && results.length === 0 && (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1b1b1b',
                  margin: '0 0 6px',
                }}
              >
                Không tìm thấy kết quả
              </p>
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: '13px',
                  color: '#6e6e6e',
                  margin: 0,
                }}
              >
                Thử tìm kiếm với từ khóa khác, ví dụ: "áo", "quần", "hoodie"
              </p>
            </div>
          )}

          {/* Results list */}
          {!loading && results.length > 0 && (
            <>
              <div style={{ padding: '12px 24px 4px' }}>
                <p
                  style={{
                    fontFamily: FONT,
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#6e6e6e',
                    textTransform: 'uppercase',
                    letterSpacing: '1.2px',
                    margin: 0,
                  }}
                >
                  Sản phẩm ({totalItems})
                </p>
              </div>
              <div style={{ padding: '4px 12px 8px' }}>
                {results.map((product, index) => {
                  const imgUrl = resolveImageUrl(getFirstImage(product));
                  const isActive = index === activeIndex;
                  return (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      onClick={handleProductClick}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: '#1b1b1b',
                        backgroundColor: isActive ? '#f7f7f7' : 'transparent',
                        transition: 'background-color 120ms ease',
                      }}
                      onMouseEnter={(e) => {
                        setActiveIndex(index);
                        e.currentTarget.style.backgroundColor = '#f7f7f7';
                      }}
                      onMouseLeave={(e) => {
                        if (index !== activeIndex)
                          e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Thumbnail */}
                      <div
                        style={{
                          width: '56px',
                          height: '70px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          backgroundColor: '#f7f7f7',
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={product.name}
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontFamily: FONT,
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#1b1b1b',
                            margin: '0 0 4px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {product.name}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {product.category && (
                            <span
                              style={{
                                fontFamily: FONT,
                                fontSize: '11px',
                                color: '#ffffff',
                                backgroundColor: '#1b1b1b',
                                padding: '2px 8px',
                                borderRadius: '3px',
                                fontWeight: 500,
                                letterSpacing: '0.3px',
                              }}
                            >
                              {product.category.name}
                            </span>
                          )}
                          <span
                            style={{
                              fontFamily: FONT,
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#1b1b1b',
                            }}
                          >
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ArrowRightOutlined
                        style={{
                          fontSize: '12px',
                          color: '#bfbfbf',
                          flexShrink: 0,
                          opacity: isActive ? 1 : 0,
                          transition: 'opacity 150ms',
                        }}
                      />
                    </Link>
                  );
                })}
              </div>

              {/* View All Button */}
              {totalItems > results.length && (
                <div style={{ padding: '8px 24px 16px' }}>
                  <button
                    onClick={handleViewAll}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      backgroundColor: '#1b1b1b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontFamily: FONT,
                      fontSize: '13px',
                      fontWeight: 600,
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 200ms ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#333'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1b1b1b'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    Xem tất cả {totalItems} kết quả
                    <ArrowRightOutlined style={{ fontSize: '12px' }} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes searchOverlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes searchSlideDown {
          from {
            opacity: 0;
            transform: translateY(-24px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes shimmer {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SearchOverlay;
