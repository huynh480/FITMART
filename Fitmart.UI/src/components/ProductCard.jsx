import * as React from 'react';
import { Link } from 'react-router-dom';
import { Modal } from 'antd';
import { cn } from '@/lib/utils';

/**
 * ProductCard – FITMART
 *
 * Design Tokens (Gymshark-inspired Monochrome system):
 *   --fm-text-primary:   #1b1b1b  (product name, price)
 *   --fm-text-secondary: #6e6e6e  (collection label)
 *   --fm-surface:        #ffffff
 *   --fm-overlay:        rgba(0,0,0,0.35)
 *
 * States implemented: default | hover | focus-visible | active |
 *                     wishlist-toggled | loading | error | disabled (out-of-stock)
 *
 * Responsive:
 *   mobile  (<768px)  → 2-col, QuickAddBar always visible
 *   tablet  (768–1023px) → 3-col
 *   desktop (≥1024px) → 4-col, hover interactions active
 */

/* ─────────────────────────────────────────────
   Heart icon (outline / filled)
───────────────────────────────────────────── */
function HeartIcon({ filled }) {
  return filled ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-5"
      aria-hidden="true"
    >
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Skeleton placeholder (loading state)
───────────────────────────────────────────── */
function ProductCardSkeleton() {
  return (
    <div className="flex flex-col" aria-busy="true" aria-label="Đang tải sản phẩm...">
      <div className="w-full aspect-[3/4] bg-gray-100 animate-pulse rounded-none" />
      <div className="flex flex-col pt-[15px] space-y-[4px]">
        <div className="h-3 w-2/3 bg-gray-100 animate-pulse rounded" />
        <div className="h-4 w-4/5 bg-gray-100 animate-pulse rounded" />
        <div className="h-4 w-1/3 bg-gray-100 animate-pulse rounded mt-1" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Image wrapper handles loading & error states
───────────────────────────────────────────── */
function ProductImage({ src, alt }) {
  const [status, setStatus] = React.useState('loading'); // 'loading' | 'loaded' | 'error'

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Skeleton while loading */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}

      {/* Error state: no broken img */}
      {status === 'error' && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="#6e6e6e"
            className="size-12 opacity-40"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
        </div>
      )}

      {/* Actual image – only render when src exists */}
      {src && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={cn(
            'w-full h-full object-cover transition-transform duration-200 ease-in-out',
            'group-hover:scale-[1.04] group-focus-within:scale-[1.04]',
            status !== 'loaded' ? 'opacity-0 absolute' : 'opacity-100'
          )}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Size Selector Modal (Quick Add)
───────────────────────────────────────────── */
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function SizeSelectorModal({ open, onClose, productName }) {
  const [selectedSize, setSelectedSize] = React.useState(null);

  const handleConfirm = () => {
    if (!selectedSize) return;
    // TODO: connect to cart store
    onClose();
    setSelectedSize(null);
  };

  const handleCancel = () => {
    onClose();
    setSelectedSize(null);
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      onOk={handleConfirm}
      title={
        <span
          style={{
            fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: '#1b1b1b',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Chọn size — {productName}
        </span>
      }
      okText="THÊM VÀO GIỎ"
      cancelText="Huỷ"
      okButtonProps={{
        disabled: !selectedSize,
        style: {
          background: selectedSize ? '#000000' : '#d9d9d9',
          color: '#ffffff',
          borderRadius: 0,
          border: 'none',
          fontFamily: "'Roboto', sans-serif",
          fontWeight: 600,
          fontSize: 12,
          letterSpacing: '0.08em',
        },
      }}
      cancelButtonProps={{
        style: {
          borderRadius: 0,
          fontFamily: "'Roboto', sans-serif",
          fontSize: 12,
        },
      }}
      styles={{
        body: { paddingTop: 16 },
      }}
      centered
    >
      <div
        style={{
          fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
          fontSize: 12,
          color: '#6e6e6e',
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        Size
      </div>
      <div className="flex flex-wrap gap-2">
        {SIZES.map((size) => (
          <button
            key={size}
            onClick={() => setSelectedSize(size)}
            aria-pressed={selectedSize === size}
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: 13,
              fontWeight: 400,
              width: 52,
              height: 44,
              border: selectedSize === size ? '2px solid #1b1b1b' : '1px solid #d9d9d9',
              background: '#ffffff',
              color: '#1b1b1b',
              cursor: 'pointer',
              transition: 'border-color 125ms ease-in-out',
              borderRadius: 0,
            }}
          >
            {size}
          </button>
        ))}
      </div>
    </Modal>
  );
}

/* ─────────────────────────────────────────────
   ProductCard — main export
───────────────────────────────────────────── */
export function ProductCard({
  id,
  slug = '#',
  image,
  productName = 'Tên sản phẩm',
  collectionName = 'COLLECTION',
  price = '0 ₫',
  isOutOfStock = false,
  isLoading = false,
  className,
}) {
  const [wishlisted, setWishlisted] = React.useState(false);
  const [wishPulse, setWishPulse] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

  const imageAlt = `${productName} - ${collectionName}`;
  const wishlistLabel = wishlisted ? 'Đã yêu thích' : 'Thêm vào yêu thích';
  const quickAddLabel = `Thêm ${productName} vào giỏ hàng`;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((prev) => !prev);
    setWishPulse(true);
    setTimeout(() => setWishPulse(false), 300);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setModalOpen(true);
  };

  if (isLoading) return <ProductCardSkeleton />;

  return (
    <>
      {/* ── Card container ── */}
      <div
        className={cn(
          'group flex flex-col focus-within:ring-2 focus-within:ring-[#1b1b1b] focus-within:ring-offset-2',
          className
        )}
      >
        {/* ── [1] ImageWrapper ── */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100">
          {/* Product Image */}
          <Link
            to={`/products/${slug}`}
            tabIndex={0}
            aria-label={productName.length > 40 ? `${productName} - ${collectionName}` : undefined}
            className="absolute inset-0 focus-visible:outline-2 focus-visible:outline-[#1b1b1b] focus-visible:outline-offset-2"
          >
            <ProductImage src={image} alt={imageAlt} />
          </Link>

          {/* [WishlistBtn] — always visible, top-right */}
          <button
            id={`wishlist-${id}`}
            type="button"
            onClick={handleWishlist}
            aria-label={wishlistLabel}
            aria-pressed={wishlisted}
            className={cn(
              // layout
              'absolute top-2 right-2 z-20',
              'flex items-center justify-center w-9 h-9',
              // color
              'text-white',
              // drop-shadow for visibility on light images
              'drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]',
              // transitions
              'transition-transform duration-200 ease-in-out',
              'hover:scale-110',
              // focus-visible
              'focus-visible:outline-2 focus-visible:outline-[#1b1b1b] focus-visible:outline-offset-2 focus-visible:rounded-sm',
              // wishlist pulse animation
              wishPulse ? 'scale-[1.3]' : 'scale-100',
            )}
            style={{ transition: 'transform 200ms ease-in-out' }}
          >
            <HeartIcon filled={wishlisted} />
          </button>

          {/* [QuickAddBar] — hidden by default, slides up on hover/focus
              On mobile (<768px): always visible (controlled via Tailwind responsive) */}
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 z-10',
              // Desktop: hidden → slides up on group-hover / group-focus-within
              'translate-y-full opacity-0',
              'group-hover:translate-y-0 group-hover:opacity-100',
              'group-focus-within:translate-y-0 group-focus-within:opacity-100',
              // Always visible on mobile
              'md:translate-y-full md:opacity-0',
              'max-md:translate-y-0 max-md:opacity-100',
              // Smooth transition
              'transition-[transform,opacity] duration-200 ease-in-out',
            )}
          >
            <button
              id={`quickadd-${id}`}
              type="button"
              onClick={handleQuickAdd}
              aria-label={isOutOfStock ? `${productName} — hết hàng` : quickAddLabel}
              disabled={isOutOfStock}
              className={cn(
                'w-full h-10',
                'font-["Roboto",sans-serif] text-[12px] font-semibold uppercase tracking-[0.08em]',
                'transition-colors duration-[125ms] ease-in-out',
                'focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-[-2px]',
                isOutOfStock
                  ? 'bg-[#6e6e6e] text-white cursor-not-allowed'
                  : 'bg-[#1b1b1b] text-white hover:bg-[#000000] active:bg-[#6e6e6e]'
              )}
            >
              {isOutOfStock ? 'HẾT HÀNG' : 'THÊM VÀO GIỎ'}
            </button>
          </div>
        </div>

        {/* ── [2] CardBody ── */}
        <div className="flex flex-col pt-[15px] pb-[16px] space-y-[4px]">
          {/* Collection label */}
          <span
            className="font-['Roboto',sans-serif] text-[12px] font-normal uppercase tracking-[0.06em]"
            style={{ color: '#6e6e6e' }}
          >
            {collectionName}
          </span>

          {/* Product name — max 2 lines */}
          <Link
            to={`/products/${slug}`}
            tabIndex={-1}
            aria-hidden="true"
            className="no-underline line-clamp-2"
          >
            <span
              className="font-['Roboto',sans-serif] text-[14px] font-normal leading-[1.35]"
              style={{ color: '#1b1b1b' }}
            >
              {productName}
            </span>
          </Link>

          {/* Price */}
          <span
            className="font-['Roboto',sans-serif] text-[14px] font-medium leading-snug"
            style={{ color: '#1b1b1b' }}
          >
            {price}
          </span>
        </div>
      </div>

      {/* ── Size Selector Modal ── */}
      <SizeSelectorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        productName={productName}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   ProductGrid — responsive layout wrapper
   Usage: wrap <ProductCard> components inside this
───────────────────────────────────────────── */
export function ProductGrid({ children, className }) {
  return (
    <div
      className={cn(
        'grid gap-x-4 gap-y-8',
        // 2-col mobile, 3-col tablet, 4-col desktop
        'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        className
      )}
    >
      {children}
    </div>
  );
}