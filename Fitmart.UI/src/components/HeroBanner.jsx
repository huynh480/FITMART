import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import heroVideo from '@/assets/148204-793717940_large.mp4';

/**
 * HeroBanner – FITMART
 * 
 * Design tokens (Gymshark Design System):
 * - color.surface.base: #000000
 * - color.surface.raised: #ffffff
 * - color.text.primary: #ffffff
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
      <section className="relative" style={{ backgroundColor: '#000000' }}>
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

        {/* ── Dark Overlay (Layer 2 — phủ lên video) ── */}
        {/* Overlay đen 70% + gradient dưới cùng để chữ trắng nổi bật */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.70)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)',
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
                  color: '#ffffff',
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
                  color: 'rgba(255, 255, 255, 0.7)',
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
                  className="h-12 rounded-none px-8 text-base font-semibold border-0 transition-all duration-200 hover:bg-neutral-200"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#000000',
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
                  className="h-12 rounded-none px-8 text-base font-semibold transition-all duration-200"
                  style={{
                    color: '#ffffff',
                    borderWidth: '1px',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
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
