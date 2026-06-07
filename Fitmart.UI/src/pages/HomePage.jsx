import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import HeroBanner from '../components/HeroBanner';
import HomeSections from '../components/HomeSections';
import { ProductCard } from '../components/ProductCard';

/**
 * HomePage – FITMART
 *
 * Layout (top → bottom):
 *   1. HeroBanner
 *   2. SẢN PHẨM MỚI      (horizontal snap slider — dùng ProductCard thật)
 *   3. BẠN TẬP LUYỆN + 3 Danh mục lớn  (HomeSections)
 *   4. SẢN PHẨM NỔI BẬT   (horizontal snap slider — dùng ProductCard thật)
 *
 * Design tokens from DESIGN.md / SKILL.md:
 *   font.family.primary  = Roboto, Helvetica, Arial, sans-serif
 *   color.text.tertiary  = #1b1b1b
 *   color.text.secondary = #6e6e6e
 *   color.surface.base   = #ffffff
 *   font.size.4xl        = 32px
 *   space.4              = 60px
 *   motion.duration.fast = 200ms
 */

/* ═══════════════════════════════════════════
   Helper: Format price to VND
   ═══════════════════════════════════════════ */
const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

/* ═══════════════════════════════════════════
   SectionHeader — Tiêu đề + "XEM TẤT CẢ"
   ═══════════════════════════════════════════ */
const SectionHeader = ({ title, linkTo = '/collections' }) => (
  <div
    className="flex items-center justify-between mb-6"
    style={{ fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif" }}
  >
    <h2
      className="m-0 text-[28px] md:text-[32px] font-extrabold uppercase tracking-[0.06em] leading-tight"
      style={{ color: '#1b1b1b' }}
    >
      {title}
    </h2>
    <Link
      to={linkTo}
      className="text-[13px] font-semibold uppercase tracking-[0.08em] underline underline-offset-4 transition-colors duration-200 hover:text-[#6e6e6e]"
      style={{
        color: '#1b1b1b',
        fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
        textDecorationColor: '#1b1b1b',
      }}
    >
      XEM TẤT CẢ
    </Link>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   ProductSlider — horizontal snap scroll dùng ProductCard thật
   ─────────────────────────────────────────────────────────────
   Mỗi card bọc trong div snap-start với chiều rộng:
     mobile : 70vw   (hiển thị ~1.3 card, gợi ý scroll)
     desktop: calc(25% - 12px)  (4 card vừa khít với gap-4=16px)
   ═══════════════════════════════════════════════════════════════ */
const ProductSlider = ({ items }) => {
  const scrollRef = useRef(null);

  return (
    <div
      ref={scrollRef}
      className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 homepage-slider"
    >
      {items.map((item) => {
        const images =
          item.productVariants && item.productVariants.length > 0
            ? [...new Set(item.productVariants.map((v) => v.imageUrl))]
            : [];

        return (
          /* Wrapper cố định chiều rộng + snap-start */
          <div
            key={item.id}
            className="flex-shrink-0 snap-start w-[70vw] md:w-[calc(25%-12px)]"
          >
            <ProductCard
              id={item.id}
              slug={item.slug || String(item.id)}
              image={images[0]}
              productName={item.name}
              collectionName={item.collection ? item.collection.toUpperCase() : 'SẢN PHẨM'}
              price={formatPrice(item.price)}
              product={item}
            />
          </div>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════
   HomePage — Main Component
   ═══════════════════════════════════════════ */
const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5049/api/Products?pageSize=60');
        const data = await response.json();
        if (data.items) {
          // Sắp xếp ID từ 1 đến 51 (tăng dần)
          const sortedItems = data.items.sort((a, b) => a.id - b.id);
          setProducts(sortedItems);
        }
      } catch (error) {
        console.error('Lỗi khi fetch sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    const antIcon = <LoadingOutlined style={{ fontSize: 48, color: '#000' }} spin />;
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Spin indicator={antIcon} />
      </div>
    );
  }

  const featuredProducts = products.filter((p) => p.isFeatured);

  return (
    <div className="bg-white min-h-screen pb-12" style={{ textAlign: 'left' }}>
      {/* ═══ 1. HERO BANNER ═══ */}
      <HeroBanner />

      {/* ═══ 2. SẢN PHẨM MỚI (Horizontal Slider) ═══ */}
      <section className="px-4 md:px-[60px] mt-14 md:mt-20">
        <SectionHeader title="SẢN PHẨM MỚI" linkTo="/collections" />
        <ProductSlider items={products} />
      </section>

      {/* ═══ 3. WORKOUT + DANH MỤC LỚN (HomeSections) ═══ */}
      <HomeSections />

      {/* ═══ 4. SẢN PHẨM NỔI BẬT (Horizontal Slider) ═══ */}
      {featuredProducts.length > 0 && (
        <section className="px-4 md:px-[60px] mt-14 md:mt-20">
          <SectionHeader title="SẢN PHẨM NỔI BẬT" linkTo="/collections" />
          <ProductSlider items={featuredProducts} />
        </section>
      )}
    </div>
  );
};

export default HomePage;