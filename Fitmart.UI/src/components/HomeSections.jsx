import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * HomeSections – Gymshark-inspired sections
 *
 * Layout:
 *   1. "BẠN TẬP LUYỆN NHƯ THẾ NÀO?" — 4-col grid with gender filter pills
 *   2. 3 Danh mục lớn — 3-col grid
 *
 * Design tokens from DESIGN.md / SKILL.md:
 *   font.family.primary  = Roboto, Helvetica, Arial, sans-serif
 *   color.text.tertiary  = #1b1b1b
 *   color.surface.base   = #ffffff
 *   motion.duration.fast = 200ms
 */

/* ══════════════════════════════════════════════
   DATA — Thay đổi imageUrl & linkTo tại đây
   ══════════════════════════════════════════════ */

const workoutDataWomen = [
  { id: 'w-run', title: 'Đang Chạy', imageUrl: '/images/chay_nu.avif', linkTo: '/collections/running-women' },
  { id: 'w-lift', title: 'Nâng', imageUrl: 'images/nang_nu.avif', linkTo: '/collections/lifting-women' },
  { id: 'w-hiit', title: 'HIIT', imageUrl: '/images/image (1).avif', linkTo: '/collections/hiit-women' },
  { id: 'w-pilates', title: 'Pilates', imageUrl: '/images/image.avif', linkTo: '/collections/pilates-women' },
];

const workoutDataMen = [
  { id: 'm-run', title: 'Đang Chạy', imageUrl: '/images/chạy_nam.avif', linkTo: '/collections/running-men' },
  { id: 'm-lift', title: 'Nâng', imageUrl: '/images/nang_nam.avif', linkTo: '/collections/lifting-men' },
  { id: 'm-hiit', title: 'HIIT', imageUrl: '/images/hiit_nam.avif', linkTo: '/collections/hiit-men' },
  { id: 'm-boxing', title: 'Đấm Bốc', imageUrl: '/images/nghi_nam.avif', linkTo: '/collections/boxing-men' },
];

const categoryData = [
  { id: 'cat-women', title: 'CỬA HÀNG DÀNH CHO NỮ', imageUrl: '/images/shop_nu.avif', linkTo: '/collections/women' },
  { id: 'cat-men', title: 'CỬA HÀNG NAM', imageUrl: '/images/shop_nam.avif', linkTo: '/collections/men' },
  { id: 'cat-accessories', title: 'MUA PHỤ KIỆN', imageUrl: '/images/shop_phuKien.avif', linkTo: '/collections/accessories' },
];

/* ══════════════════════════════════════════════
   SectionHeader — same style as product sliders
   ══════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════
   WorkoutCard — 4-col grid item
   ══════════════════════════════════════════════ */
const WorkoutCard = ({ item }) => (
  <Link to={item.linkTo} className="block no-underline group" aria-label={item.title}>
    {/* Portrait image */}
    <div className="overflow-hidden aspect-[4/5] bg-[#f5f5f5]">
      <img
        src={item.imageUrl}
        alt={item.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-[500ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.06]"
      />
    </div>
    {/* Caption BELOW image — uppercase, normal weight like product text */}
    <p
      className="mt-3 mb-0 text-[14px] font-bold uppercase tracking-[0.06em] text-left leading-snug"
      style={{
        color: '#1b1b1b',
        fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
      }}
    >
      {item.title}
    </p>
  </Link>
);

/* ══════════════════════════════════════════════
   CategoryCard — 3-col grid item
   ══════════════════════════════════════════════ */
const CategoryCard = ({ item }) => (
  <Link to={item.linkTo} className="block no-underline group" aria-label={item.title}>
    {/* Portrait image */}
    <div className="overflow-hidden aspect-[3/4] bg-[#f5f5f5]">
      <img
        src={item.imageUrl}
        alt={item.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-[500ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.06]"
      />
    </div>
    {/* Caption BELOW image — uppercase, normal weight like product text */}
    <p
      className="mt-3 mb-0 text-[14px] font-bold uppercase tracking-[0.06em] text-left"
      style={{
        color: '#1b1b1b',
        fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
      }}
    >
      {item.title}
    </p>
  </Link>
);

/* ══════════════════════════════════════════════
   HomeSections — main export
   ══════════════════════════════════════════════ */
const HomeSections = () => {
  const [activeGender, setActiveGender] = useState('women');

  const workoutItems = activeGender === 'women' ? workoutDataWomen : workoutDataMen;

  return (
    <>
      {/* ═══ SECTION: BẠN TẬP LUYỆN NHƯ THẾ NÀO? ═══ */}
      <section className="px-4 md:px-[60px] mt-14 md:mt-20" style={{ textAlign: 'left' }}>
        {/* Header — same style as product slider headers */}
        <SectionHeader title="BẠN TẬP LUYỆN NHƯ THẾ NÀO?" linkTo="/collections" />

        {/* Gender filter pills */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveGender('women')}
            className="px-6 py-2 rounded-full text-[13px] font-bold uppercase tracking-[0.1em] border-[1.5px] border-[#1b1b1b] transition-all duration-[200ms] cursor-pointer"
            style={{
              fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
              backgroundColor: activeGender === 'women' ? '#1b1b1b' : 'transparent',
              color: activeGender === 'women' ? '#ffffff' : '#1b1b1b',
            }}
          >
            PHỤ NỮ
          </button>
          <button
            type="button"
            onClick={() => setActiveGender('men')}
            className="px-6 py-2 rounded-full text-[13px] font-bold uppercase tracking-[0.1em] border-[1.5px] border-[#1b1b1b] transition-all duration-[200ms] cursor-pointer"
            style={{
              fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
              backgroundColor: activeGender === 'men' ? '#1b1b1b' : 'transparent',
              color: activeGender === 'men' ? '#ffffff' : '#1b1b1b',
            }}
          >
            ĐÀN ÔNG
          </button>
        </div>

        {/* 4-column grid with animated transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGender}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3"
          >
            {workoutItems.map((item) => (
              <WorkoutCard key={item.id} item={item} />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ═══ SECTION: 3 Danh mục lớn ═══ */}
      <section className="px-4 md:px-[60px] mt-14 md:mt-20" style={{ textAlign: 'left' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {categoryData.map((item) => (
            <CategoryCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </>
  );
};

export default HomeSections;
