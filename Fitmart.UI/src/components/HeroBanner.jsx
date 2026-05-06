import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import heroVideo from '@/assets/148204-793717940_large.mp4';

/**
 * HeroBanner – FITMART
 * 
 * Design tokens (Gymshark Design System):
 * - color.surface.base: #ffffff
 * - color.surface.raised: #000000
 * - color.text.primary: #000000
 * - color.text.secondary: #6e6e6e
 * - color.text.inverse: #000000
 * - font.family.primary: Roboto
 * - font.size.4xl: 32px (adapted to responsive hero scale)
 * - motion.duration.fast: 200ms
 */

const HeroBanner = () => {
  return (
    <div className="overflow-x-hidden">
      {/* ══════════ HERO SECTION ══════════ */}
      <section className="relative" style={{ backgroundColor: '#ffffff' }}>
        {/* ── Video Background (Layer 1 — dưới cùng) ── */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src={heroVideo}
          />
        </div>

        {/* ── Light Overlay (Layer 2 — phủ lên video) ── */}
        {/* Overlay trắng nhẹ + gradient để giữ độ tương phản cho chữ đen */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.70)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 40%, rgba(255,255,255,0.92) 100%)',
          }}
        />

        {/* ── Text Content (Layer 3 — trên cùng, z-10) ── */}
        <div className="relative z-10 py-24 md:pb-32 lg:pb-36 lg:pt-44">
          <div className="mx-auto flex max-w-7xl flex-col px-6 lg:block lg:px-12">
            <div className="mx-auto max-w-lg text-center lg:ml-0 lg:max-w-full lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="mt-8 max-w-3xl text-balance font-bold uppercase tracking-tight lg:mt-16"
                style={{
                  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                  fontSize: 'clamp(32px, 6vw, 72px)',
                  lineHeight: 1.05,
                  color: '#000000',
                }}
              >
                ĐÁNH THỨC SỨC MẠNH BÊN TRONG
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                className="mt-6 max-w-xl text-balance"
                style={{
                  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#6e6e6e',
                }}
              >
                Trang bị hoàn hảo cho mọi bài tập. Từ tạ đơn đến đồ tập cao cấp — 
                tất cả tại FITMART. Nơi chinh phục giới hạn bắt đầu.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
                className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
              >
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-[4px] px-[16px] text-base font-semibold border-0 transition-all duration-200 hover:bg-[#1b1b1b]"
                  style={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    fontFamily: "'Roboto', sans-serif",
                  }}
                >
                  <Link to="/products">
                    <span className="text-nowrap uppercase tracking-wider">Khám phá ngay</span>
                    <ChevronRight className="ml-1 size-5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="h-12 rounded-[4px] px-[16px] text-base font-semibold transition-all duration-200 hover:bg-[#f5f5f5]"
                  style={{
                    color: '#000000',
                    borderWidth: '1px',
                    borderColor: '#d9d9d9',
                    fontFamily: "'Roboto', sans-serif",
                  }}
                >
                  <Link to="/category/new">
                    <span className="text-nowrap uppercase tracking-wider">Bộ sưu tập mới</span>
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroBanner;
