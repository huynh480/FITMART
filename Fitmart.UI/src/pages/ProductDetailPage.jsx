import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCT_DETAIL_DATA, getProductBySlug, formatPrice } from '../config/productData';
import { ImageGallery } from '../components/ui/ImageGallery';
import { ColorSwatch } from '../components/ui/ColorSwatch';
import { SizeSelector } from '../components/ui/SizeSelector';
import { QuantityInput } from '../components/ui/QuantityInput';
import { ProductCard } from '../components/ProductCard';

export default function ProductDetailPage() {
  const { slug } = useParams();
  
  // Try to load product by slug, fallback to mock data for demonstration
  const product = getProductBySlug(slug) || PRODUCT_DETAIL_DATA;

  const [selectedColorId, setSelectedColorId] = React.useState(product.colors[0]?.id);
  const [selectedSize, setSelectedSize] = React.useState(null);
  const [quantity, setQuantity] = React.useState(1);
  const [isAdding, setIsAdding] = React.useState(false);
  const [addSuccess, setAddSuccess] = React.useState(false);

  // Derive active color images
  const activeColor = product.colors.find((c) => c.id === selectedColorId) || product.colors[0];
  const images = activeColor?.images || [];

  const handleAddToCart = () => {
    if (!selectedSize || isAdding || addSuccess) return;
    
    setIsAdding(true);
    // Simulate API call
    setTimeout(() => {
      setIsAdding(false);
      setAddSuccess(true);
      
      // Reset success state after 1.5s
      setTimeout(() => setAddSuccess(false), 1500);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
        
        {/* 1. Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8 font-['Roboto',sans-serif]">
          <Link to="/" className="text-[#6e6e6e] hover:text-[#1b1b1b] transition-colors">Trang chủ</Link>
          <span className="text-[#6e6e6e]">/</span>
          <Link to={`/collections/${product.slug.split('/')[0] || 'nam'}`} className="text-[#6e6e6e] hover:text-[#1b1b1b] transition-colors uppercase">
            Danh mục
          </Link>
          <span className="text-[#6e6e6e]">/</span>
          <span className="text-[#1b1b1b] font-medium truncate">{product.name}</span>
        </nav>

        {/* 2. Product Section (2 Columns) */}
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16 mb-20">
          
          {/* Left Column: Image Gallery */}
          <div className="w-full lg:w-1/2">
            <ImageGallery images={images} altBase={product.name} />
          </div>

          {/* Right Column: Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col pt-2 lg:pt-0">
            
            <span className="text-sm font-medium text-[#6e6e6e] tracking-widest uppercase mb-2">
              {product.collectionName}
            </span>
            <h1 
              className="text-2xl md:text-3xl font-medium text-[#1b1b1b] mb-4 leading-tight opacity-100"
              style={{ color: '#1b1b1b', opacity: 1 }}
            >
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-8">
              {product.salePrice ? (
                <>
                  <span className="text-xl md:text-2xl font-bold text-[#1b1b1b]">
                    {formatPrice(product.salePrice)}
                  </span>
                  <span className="text-lg text-[#9e9e9e] line-through">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-xl md:text-2xl font-bold text-[#1b1b1b]">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-8 mb-8">
              <ColorSwatch 
                colors={product.colors} 
                selectedId={selectedColorId} 
                onChange={setSelectedColorId} 
              />
              
              <SizeSelector 
                sizes={product.sizes} 
                selectedSize={selectedSize} 
                onChange={setSelectedSize} 
              />
              
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
                w-full h-14 flex items-center justify-center
                font-['Roboto',sans-serif] text-[14px] font-bold uppercase tracking-[0.08em]
                transition-all duration-200 ease-in-out mb-10 bg-[#000000] text-[#ffffff]
                ${!selectedSize 
                  ? 'opacity-40 cursor-not-allowed' 
                  : addSuccess 
                    ? 'opacity-100' 
                    : 'opacity-100 hover:bg-[#1b1b1b] active:scale-[0.98]'
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

            {/* Accordions */}
            <div className="flex flex-col">
              <Accordion title="MÔ TẢ SẢN PHẨM" content={product.description} defaultOpen />
              <Accordion title="CHẤT LIỆU" content={product.material} />
              <Accordion title="HƯỚNG DẪN BẢO QUẢN" content={product.careInstructions} />
            </div>

          </div>
        </div>

        {/* 3. Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="pt-10 border-t border-[#ebebeb]">
            <h2 className="text-xl md:text-2xl font-medium text-[#1b1b1b] mb-8 text-center md:text-left">
              SẢN PHẨM LIÊN QUAN
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {product.relatedProducts.map(rel => (
                <ProductCard 
                  key={rel.id}
                  id={rel.id}
                  slug={rel.slug}
                  image={rel.image}
                  productName={rel.productName}
                  collectionName={rel.collectionName}
                  price={rel.price}
                  isOutOfStock={rel.isOutOfStock}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Accordion({ title, content, defaultOpen = false }) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="bg-white border-t border-[#e5e5e5]">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
      >
        <span className="font-['Roboto',sans-serif] text-[14px] font-medium text-[#1b1b1b] tracking-wider uppercase">
          {title}
        </span>
        <span className="text-[#1b1b1b] text-xs transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
          ▼
        </span>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-[15px] text-[#1b1b1b] text-left leading-relaxed font-['Roboto',sans-serif]">
          {content}
        </p>
      </div>
    </div>
  );
}
