import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import heroVideo from '@/assets/148204-793717940_large.mp4';

/**
 * HeroBanner – FITMART
 *
 * Fix: global `h1,h2 { color: var(--text-h); font-weight:500 }` in index.css
 * overrides Tailwind layered utilities. Solved with inline styles (highest priority).
 */

const HeroBanner = () => {
  return (
    <div style={{ overflow: 'hidden' }}>
      {/* ══════════ HERO SECTION ══════════ */}
      <section
        style={{
          position: 'relative',
          minHeight: '88vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* ── Layer 1: Video Background ── */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            src={heroVideo}
          />
        </div>

        {/* ── Layer 2: Gradient Overlay ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to right, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.05) 100%)',
          }}
        />

        {/* ── Layer 3: Text Content ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 48px',
          }}
        >
          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            style={{
              /* Force override global h1 styles */
              color: '#ffffff',
              fontWeight: 900,
              fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
              fontSize: 'clamp(2.6rem, 5.5vw, 4.5rem)',
              lineHeight: 1.07,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              maxWidth: '700px',
              margin: '0 0 24px 0',
              textShadow: '0 2px 24px rgba(0,0,0,0.35)',
            }}
          >
            ĐÁNH THỨC SỨC MẠNH BÊN TRONG
          </motion.h1>

          {/* Sub-text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18, ease: 'easeOut' }}
            style={{
              color: 'rgba(255,255,255,0.88)',
              fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
              fontSize: '17px',
              lineHeight: '1.65',
              fontWeight: 400,
              maxWidth: '480px',
              margin: '0 0 40px 0',
            }}
          >
            Trang bị hoàn hảo cho mọi bài tập. Từ tạ đơn đến đồ tập cao cấp —
            tất cả tại FITMART. Nơi chinh phục giới hạn bắt đầu.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.34, ease: 'easeOut' }}
          >
            <Link
              to="/collections?sort=newest"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ffffff',
                color: '#000000',
                fontFamily: "'Roboto', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                padding: '14px 28px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#e0e0e0';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              KHÁM PHÁ NGAY
              <ChevronRight size={18} strokeWidth={2.5} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HeroBanner;
