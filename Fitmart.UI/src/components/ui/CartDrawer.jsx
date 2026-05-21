import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../config/productData';

/* ─────────────────────────────────────────────────────────────────────
   CartDrawer — slide-in from the right, 420 px, overlay behind.
   ───────────────────────────────────────────────────────────────────── */
export default function CartDrawer() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    totalPrice,
    totalItems,
    isCartOpen,
    closeCart,
  } = useCart();

  const navigate = useNavigate();
  const drawerRef = useRef(null);

  const totalSavings = cartItems.reduce((sum, item) => {
    const original = item.originalPrice || item.price;
    const sale = item.salePrice;
    if (sale && original > sale) {
      return sum + (original - sale) * item.quantity;
    }
    return sum;
  }, 0);

  /* ── Lock body scroll while open ─────────────────────────────────── */
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  /* ── Close on Escape ─────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isCartOpen) closeCart();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isCartOpen, closeCart]);

  /* ── Helpers ─────────────────────────────────────────────────────── */
  const goToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const goHome = () => {
    closeCart();
    navigate('/');
  };

  /* ═══════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Overlay ── */}
      <div
        id="cart-overlay"
        onClick={closeCart}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          opacity: isCartOpen ? 1 : 0,
          pointerEvents: isCartOpen ? 'all' : 'none',
          transition: 'opacity 300ms ease',
        }}
      />

      {/* ── Drawer panel ── */}
      <aside
        ref={drawerRef}
        id="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Giỏ hàng"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '420px',
          maxWidth: '100vw',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms ease',
        }}
      >
        {/* ─── HEADER ─────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #e5e5e5',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: '#1b1b1b',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}
          >
            Giỏ hàng ({totalItems})
          </h2>
          <button
            id="cart-close-btn"
            aria-label="Đóng giỏ hàng"
            onClick={closeCart}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1b1b1b',
              transition: 'opacity 200ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ─── BODY (scrollable) ──────────────────────────────────── */}
        <div
          id="cart-body"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: cartItems.length === 0 ? '0' : '0',
          }}
        >
          {cartItems.length === 0 ? (
            /* ── Empty state ── */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '40px 24px',
                textAlign: 'center',
                gap: '16px',
              }}
            >
              {/* Large bag icon */}
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ opacity: 0.25 }}
              >
                <path
                  d="M16 20h32l-3 32H19L16 20z"
                  stroke="#1b1b1b"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M24 20v-4a8 8 0 0 1 16 0v4"
                  stroke="#1b1b1b"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              <p
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#6e6e6e',
                  margin: 0,
                }}
              >
                Giỏ hàng của bạn đang trống
              </p>

              <button
                id="cart-explore-btn"
                onClick={goHome}
                style={{
                  marginTop: '8px',
                  padding: '14px 32px',
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                  backgroundColor: '#1b1b1b',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 200ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#333')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1b1b1b')}
              >
                Khám phá sản phẩm
              </button>
            </div>
          ) : (
            /* ── Item list ── */
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={removeFromCart}
                  onUpdateQty={updateQuantity}
                />
              ))}
            </ul>
          )}
        </div>

        {/* ─── FOOTER (fixed bottom, only when items exist) ───────── */}
        {cartItems.length > 0 && (
          <div
            id="cart-footer"
            style={{
              flexShrink: 0,
              borderTop: '1px solid #e5e5e5',
              padding: '20px 24px 24px',
              backgroundColor: '#ffffff',
            }}
          >
            {/* Subtotal row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '4px',
              }}
            >
              <span
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1b1b1b',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                Tổng tiền
              </span>
              <span
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1b1b1b',
                }}
              >
                {formatPrice(totalPrice)}
              </span>
            </div>

            {/* Savings row */}
            {totalSavings > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '4px',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: '12px',
                    color: '#e53935',
                  }}
                >
                  Tiết kiệm:
                </span>
                <span
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#e53935',
                  }}
                >
                  {formatPrice(totalSavings)}
                </span>
              </div>
            )}

            <p
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: '12px',
                color: '#9e9e9e',
                margin: '0 0 16px',
              }}
            >
              Phí ship tính khi thanh toán
            </p>

            {/* Checkout CTA */}
            <button
              id="cart-checkout-btn"
              onClick={goToCheckout}
              style={{
                width: '100%',
                height: '50px',
                fontFamily: "'Roboto', sans-serif",
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: '#ffffff',
                backgroundColor: '#000000',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 200ms ease',
                marginBottom: '10px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1b1b1b')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#000000')}
            >
              Thanh toán
            </button>

            {/* Continue shopping */}
            <button
              id="cart-continue-btn"
              onClick={closeCart}
              style={{
                width: '100%',
                height: '44px',
                fontFamily: "'Roboto', sans-serif",
                fontSize: '13px',
                fontWeight: 500,
                color: '#1b1b1b',
                backgroundColor: 'transparent',
                border: '1px solid #d0d0d0',
                cursor: 'pointer',
                letterSpacing: '0.5px',
                transition: 'border-color 200ms ease, background-color 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1b1b1b';
                e.currentTarget.style.backgroundColor = '#fafafa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d0d0d0';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   CartItem — single row inside the drawer
   ═════════════════════════════════════════════════════════════════════ */
function CartItem({ item, onRemove, onUpdateQty }) {
  const lineTotal = item.price * item.quantity;

  return (
    <li
      style={{
        display: 'flex',
        gap: '14px',
        padding: '16px 24px',
        borderBottom: '1px solid #f0f0f0',
        position: 'relative',
        animation: 'cartItemFadeIn 250ms ease forwards',
      }}
    >
      {/* Product image */}
      <div
        style={{
          width: '80px',
          height: '80px',
          flexShrink: 0,
          backgroundColor: '#f5f5f5',
          overflow: 'hidden',
        }}
      >
        <img
          src={item.image}
          alt={item.name}
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Name */}
        <p
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: '14px',
            fontWeight: 500,
            color: '#1b1b1b',
            margin: '0 0 4px',
            lineHeight: '1.35',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            paddingRight: '24px',
            textAlign: 'left',
          }}
        >
          {item.name}
        </p>

        {/* Color + Size */}
        <p
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: '12px',
            color: '#6e6e6e',
            margin: '0 0 10px',
            textAlign: 'left',
          }}
        >
          {item.colorName} / {item.size}
        </p>

        {/* Quantity + Price row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Inline quantity control */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              border: '1px solid #d0d0d0',
              height: '32px',
            }}
          >
            <button
              aria-label="Giảm số lượng"
              onClick={() => onUpdateQty(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              style={{
                width: '32px',
                height: '100%',
                background: 'none',
                border: 'none',
                cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                color: item.quantity <= 1 ? '#c0c0c0' : '#1b1b1b',
                fontSize: '16px',
                fontFamily: "'Roboto', sans-serif",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 150ms',
              }}
              onMouseEnter={(e) => {
                if (item.quantity > 1) e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              −
            </button>
            <span
              style={{
                width: '32px',
                textAlign: 'center',
                fontFamily: "'Roboto', sans-serif",
                fontSize: '13px',
                fontWeight: 500,
                color: '#1b1b1b',
                borderLeft: '1px solid #d0d0d0',
                borderRight: '1px solid #d0d0d0',
                lineHeight: '32px',
                userSelect: 'none',
              }}
            >
              {item.quantity}
            </span>
            <button
              aria-label="Tăng số lượng"
              onClick={() => onUpdateQty(item.id, item.quantity + 1)}
              disabled={item.quantity >= 99}
              style={{
                width: '32px',
                height: '100%',
                background: 'none',
                border: 'none',
                cursor: item.quantity >= 99 ? 'not-allowed' : 'pointer',
                color: item.quantity >= 99 ? '#c0c0c0' : '#1b1b1b',
                fontSize: '16px',
                fontFamily: "'Roboto', sans-serif",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 150ms',
              }}
              onMouseEnter={(e) => {
                if (item.quantity < 99) e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              +
            </button>
          </div>

          {/* Line total */}
          <span
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              color: '#1b1b1b',
            }}
          >
            {formatPrice(lineTotal)}
          </span>
        </div>
      </div>

      {/* ── Remove button (top-right) ── */}
      <button
        aria-label={`Xóa ${item.name}`}
        onClick={() => onRemove(item.id)}
        style={{
          position: 'absolute',
          top: '14px',
          right: '20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          color: '#6e6e6e',
          fontSize: '12px',
          transition: 'color 200ms',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#000')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#6e6e6e')}
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>

      {/* Fade-in animation */}
      <style>{`
        @keyframes cartItemFadeIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </li>
  );
}
