import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatPrice } from '../config/productData';
import { SizeSelector } from '../components/ui/SizeSelector';
import { QuantityInput } from '../components/ui/QuantityInput';
import { useCart } from '../hooks/useCart';
import { ProductCard } from '../components/ProductCard';

const BACKEND_URL = 'http://localhost:5049';

// Fallback placeholder for broken images
const PLACEHOLDER_IMG = 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22400%22 height%3D%22533%22 viewBox%3D%220 0 400 533%22%3E%3Crect width%3D%22400%22 height%3D%22533%22 fill%3D%22%23f5f5f5%22%2F%3E%3Ctext x%3D%2250%25%22 y%3D%2250%25%22 dominant-baseline%3D%22middle%22 text-anchor%3D%22middle%22 font-family%3D%22sans-serif%22 font-size%3D%2214%22 fill%3D%22%23aaa%22%3ENo Image%3C%2Ftext%3E%3C%2Fsvg%3E';

function ProductDetailPage() {
  const { slug } = useParams();

  const [product, setProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [activeImage, setActiveImage] = React.useState('');
  const [imageVisible, setImageVisible] = React.useState(true);
  const [selectedSize, setSelectedSize] = React.useState(null);
  const [quantity, setQuantity] = React.useState(1);
  const [isAdding, setIsAdding] = React.useState(false);
  const [addSuccess, setAddSuccess] = React.useState(false);
  const [relatedProducts, setRelatedProducts] = React.useState([]);
  const [selectedColor, setSelectedColor] = React.useState(null);
  const { addToCart, openCart } = useCart();

  // Extract unique colors from variants (excluding 'Default')
  const uniqueColors = React.useMemo(() => {
    if (!product?.productVariants) return [];
    const colorSet = new Set();
    product.productVariants.forEach(v => {
      if (v.color && v.color !== 'Default') colorSet.add(v.color);
    });
    return [...colorSet];
  }, [product]);

  // Auto-select first color when product loads
  React.useEffect(() => {
    if (uniqueColors.length > 0 && !selectedColor) {
      setSelectedColor(uniqueColors[0]);
    }
  }, [uniqueColors, selectedColor]);

  // Filter images by selected color
  const filteredImages = React.useMemo(() => {
    if (!product?.productImages) return [];
    if (!selectedColor || uniqueColors.length === 0) return product.productImages;
    const selColorName = selectedColor.split(':')[0];
    return product.productImages.filter(img => {
      // Show images with no color (shared) OR matching the selected color
      if (!img.colorName) return true;
      const imgColorName = img.colorName.split(':')[0];
      return imgColorName === selColorName;
    });
  }, [product, selectedColor, uniqueColors]);

  // Helper to resolve absolute image URL
  const resolveImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
    return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    setSelectedColor(null);
    setSelectedSize(null);
    setQuantity(1);
    fetch(`${BACKEND_URL}/api/products/${slug}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Không thể tải thông tin sản phẩm từ backend.');
        }
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        const initialImg = (data.productVariants && data.productVariants[0]?.imageUrl) || (data.productImages && data.productImages[0]?.imageUrl) || '';
        setActiveImage(resolveImageUrl(initialImg));
        setLoading(false);

        // Gọi API lấy các sản phẩm cùng danh mục
        if (data.categoryId) {
          fetch(`${BACKEND_URL}/api/products?categoryId=${data.categoryId}`)
            .then((res) => res.json())
            .then((relatedData) => {
              const items = relatedData.items || (Array.isArray(relatedData) ? relatedData : []);
              const filtered = items
                .filter((p) => p.id !== data.id)
                .slice(0, 4);
              setRelatedProducts(filtered);
            })
            .catch((err) => console.error('Lỗi khi tải sản phẩm tương tự:', err));
        }
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  // Smooth image swap with fade transition
  const handleImageChange = (url) => {
    if (url === activeImage) return;
    setImageVisible(false);
    setTimeout(() => {
      setActiveImage(url);
      setImageVisible(true);
    }, 150);
  };

  const handleAddToCart = () => {
    if (!selectedSize || isAdding || addSuccess || !product) return;

    setIsAdding(true);

    // Gom toàn bộ thông tin giỏ hàng
    const cartPayload = {
      productId: product.id,
      name: product.name,
      size: selectedSize,
      colorName: selectedColor ? selectedColor.split(':')[0] : 'Mặc định',
      quantity,
      price: product.salePrice || product.price,
      image: activeImage,
      slug,
    };

    // Debug: hiển thị payload trong console trước khi gửi vào Context
    console.log('[Cart] Thêm vào giỏ hàng:', cartPayload);

    // Chuẩn bị đối tượng color cho useCart.addToCart
    const virtualColor = {
      id: 'default',
      name: cartPayload.colorName,
      images: [activeImage],
    };

    setTimeout(() => {
      const cartProduct = {
        ...product,
        slug,
      };
      addToCart(cartProduct, selectedSize, virtualColor, quantity);
      setIsAdding(false);
      setAddSuccess(true);
      openCart();

      setTimeout(() => setAddSuccess(false), 1500);
    }, 400);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-['Roboto',sans-serif]">Đang tải chi tiết sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Lỗi xảy ra</h2>
        <p className="text-gray-600 mb-8">{error || 'Không tìm thấy sản phẩm.'}</p>
        <Link to="/" className="px-6 h-12 bg-black text-white flex items-center font-bold uppercase tracking-wider">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  // Tìm variant khớp với size + color đang chọn
  const currentColorName = selectedColor ? selectedColor.split(':')[0] : null;

  // Extract sizes from variants — lọc theo màu đang chọn
  const sizes = product.productVariants
    ? [...new Set(product.productVariants.map((v) => v.size))].map((sizeLabel) => {
        // Tìm variant khớp size + color hiện tại
        const matchedVariant = currentColorName
          ? product.productVariants.find((v) => v.size === sizeLabel && v.color === currentColorName)
          : product.productVariants.find((v) => v.size === sizeLabel);
        const stock = matchedVariant ? matchedVariant.stockQuantity : 0;
        return {
          label: sizeLabel,
          inStock: stock > 0,
          stockQuantity: stock,
        };
      })
    : [];

  // Variant đang chọn (khớp cả size + color)
  const selectedVariant = (selectedSize && product.productVariants)
    ? product.productVariants.find(
        (v) => v.size === selectedSize && v.color === (currentColorName || v.color)
      )
    : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">

        {/* 1. Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8 font-['Roboto',sans-serif]">
          <Link
            to="/"
            style={{ color: '#6e6e6e', textDecoration: 'none' }}
            className="transition-colors hover:text-[#1b1b1b]"
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1b1b1b'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6e6e6e'; }}
          >
            Trang chủ
          </Link>
          <span className="text-[#6e6e6e]">/</span>
          <span className="text-[#1b1b1b] font-medium truncate">{product.name}</span>
        </nav>

        {/* 2. Product Section — 2 Columns, sticky sidebar on right */}
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16 mb-20 items-start">

          {/* Left Column: Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            {/* Active Image with fade transition */}
            <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100 border border-[#ebebeb] flex items-center justify-center">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }}
                  className="w-full h-full object-cover object-center"
                  style={{
                    transition: 'opacity 0.25s ease',
                    opacity: imageVisible ? 1 : 0,
                  }}
                />
              ) : (
                <div className="text-gray-400 text-sm">Không có ảnh</div>
              )}
            </div>

            {/* Thumbnails row — filtered by selected color */}
            {filteredImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {filteredImages.map((img, index) => {
                  const resolvedUrl = resolveImageUrl(img.imageUrl);
                  const isActive = activeImage === resolvedUrl;
                  return (
                    <button
                      key={img.id || index}
                      type="button"
                      onClick={() => handleImageChange(resolvedUrl)}
                      className={`relative w-20 aspect-[3/4] flex-shrink-0 overflow-hidden transition-all duration-300 ${
                        isActive
                          ? 'border-2 border-black ring-0'
                          : 'border-2 border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={resolvedUrl}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Product Info — Sticky */}
          <div className="w-full lg:w-1/2 flex flex-col pt-2 lg:pt-0 lg:sticky lg:top-24 lg:self-start space-y-8">

            <div>
              <span className="text-xs font-medium text-[#6e6e6e] tracking-widest uppercase mb-2 block">
                {product.collection || 'SẢN PHẨM MỚI'}
              </span>
              <h1
                className="text-2xl md:text-3xl font-medium text-[#1b1b1b] mb-4 leading-tight"
                style={{ color: '#1b1b1b', opacity: 1 }}
              >
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3">
                <span className="text-xl md:text-2xl font-bold text-[#1b1b1b]">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>

            {/* Color Picker */}
            {uniqueColors.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#1b1b1b] uppercase tracking-wider mb-3">
                  Màu sắc: <span className="font-normal normal-case text-[#6e6e6e]">{selectedColor ? selectedColor.split(':')[0] : ''}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {uniqueColors.map(colorStr => {
                    const [name, hex] = colorStr.includes(':') ? colorStr.split(':') : [colorStr, '#888'];
                    const isActive = selectedColor === colorStr;
                    // Kiểm tra xem màu này còn hàng không (tất cả variant của màu này)
                    const colorName = colorStr.split(':')[0];
                    const colorVariants = product.productVariants?.filter(v => v.color === colorName) || [];
                    const colorHasStock = colorVariants.some(v => v.stockQuantity > 0);
                    return (
                      <div key={colorStr} className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          title={colorHasStock ? name : `${name} — Hết hàng`}
                          disabled={!colorHasStock}
                          onClick={() => {
                            if (!colorHasStock) return;
                            setSelectedColor(colorStr);
                            setSelectedSize(null);
                            const selColorName = colorStr.split(':')[0];
                            const firstImg = product.productImages?.find(img => {
                              if (!img.colorName) return false;
                              return img.colorName.split(':')[0] === selColorName;
                            }) || product.productImages?.find(img => !img.colorName);
                            if (firstImg) handleImageChange(resolveImageUrl(firstImg.imageUrl));
                          }}
                          className={`w-9 h-9 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                            !colorHasStock
                              ? 'opacity-40 cursor-not-allowed border-gray-300'
                              : isActive
                                ? 'border-black scale-110'
                                : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                          }`}
                        >
                          <span
                            className="w-6 h-6 rounded-full"
                            style={{
                              backgroundColor: hex,
                              border: hex === '#ffffff' ? '1px solid #d0d0d0' : 'none',
                            }}
                          />
                        </button>
                        {!colorHasStock && (
                          <span className="text-[10px] text-red-400 font-medium">Hết hàng</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-6">
              <SizeSelector
                sizes={sizes}
                selectedSize={selectedSize}
                onChange={setSelectedSize}
              />

              {/* Hiển thị số lượng tồn kho của variant đang chọn dưới dạng Badge Pill tinh tế */}
              {selectedVariant && (
                <div className="flex items-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-black border border-emerald-100 rounded-full text-xs font-semibold tracking-wide">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    Còn lại: {selectedVariant.stockQuantity} sản phẩm
                  </span>
                </div>
              )}
            </div>

            <div>
              <QuantityInput
                value={quantity}
                onChange={setQuantity}
              />
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedSize || isAdding}
              className={`
                w-full h-14 flex items-center justify-center rounded-full
                font-['Roboto',sans-serif] text-[14px] font-bold uppercase tracking-widest
                transition-all duration-200 ease-in-out bg-black text-white
                ${!selectedSize
                  ? 'opacity-40 cursor-not-allowed'
                  : addSuccess
                    ? 'opacity-100'
                    : 'opacity-100 hover:bg-zinc-800 active:scale-95'
                }
              `}
            >
              {addSuccess ? (
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  ĐÃ THÊM VÀO GIỎ
                </span>
              ) : isAdding ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'THÊM VÀO GIỎ'
              )}
            </button>

            {/* Accordions — Gymshark minimal style
                 - MÔ TẢ SẢN PHẨM: mở sẵn khi tải trang (defaultOpen)
                 - CHẤT LIỆU, HƯỚNG DẪN BẢO QUẢN: đóng mặc định, click để mở */}
            <div className="flex flex-col border-t border-gray-200 pt-4">
              <Accordion title="MÔ TẢ SẢN PHẨM" content={product.description || 'Chưa có mô tả.'} defaultOpen />
              <Accordion title="CHẤT LIỆU" content="Chất liệu thun cotton/polyester cao cấp, co giãn tốt, thoáng khí hỗ trợ tập luyện tối đa." />
              <Accordion title="HƯỚNG DẪN BẢO QUẢN" content="Giặt máy với chu kỳ nhẹ ở nhiệt độ tối đa 30 độ C. Không sử dụng thuốc tẩy. Ủi ở nhiệt độ thấp nếu cần." />
            </div>

          </div>
        </div>

        {/* 3. Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-gray-200 pt-16">
            <div className="flex flex-col items-center mb-12">
              <h2 
                className="font-['Roboto',sans-serif] text-2xl md:text-3xl font-extrabold uppercase tracking-widest"
                style={{ color: '#000000', opacity: 1 }}
              >
                Sản phẩm tương tự
              </h2>
              <div className="w-16 h-[3px] mt-3" style={{ backgroundColor: '#000000', opacity: 1 }}></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => {
                const pImg = (p.productVariants && p.productVariants[0]?.imageUrl) || (p.productImages && p.productImages[0]?.imageUrl) || '';
                const targetSlug = p.slug || String(p.id);

                return (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    slug={targetSlug}
                    image={pImg}
                    productName={p.name}
                    collectionName={p.collection ? p.collection.toUpperCase() : 'SẢN PHẨM'}
                    price={formatPrice(p.price)}
                    product={p}
                  />
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Gymshark-style minimal accordion — white bg, thin border, + / - icon
function Accordion({ title, content, defaultOpen = false }) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="bg-white border-b border-gray-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
      >
        <span className="font-['Roboto',sans-serif] text-xs font-bold text-[#1b1b1b] tracking-widest uppercase">
          {title}
        </span>
        {/* Plus / Minus icon */}
        <span
          className="text-[#1b1b1b] text-lg leading-none select-none transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
        >
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-[14px] text-[#4a4a4a] text-left leading-relaxed font-['Roboto',sans-serif] whitespace-pre-line">
          {content}
        </p>
      </div>
    </div>
  );
}

export default ProductDetailPage;
