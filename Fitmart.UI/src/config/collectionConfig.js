/**
 * collectionConfig.js
 * Single source of truth for all CollectionPage instances.
 *
 * Each entry drives:
 *  - CollectionHero  (name, productCountLabel, description, relatedTags)
 *  - FilterSidebar   (filters.categories, filters.collections)
 *  - CollectionPage  (apiCategory for fetch, slug for routing)
 *
 * To add a new collection: append a new object here. No JSX changes needed.
 */

export const COLLECTION_CONFIG = [
  // ── NAM ────────────────────────────────────────────────────────────────────
  {
    slug: 'nam',
    name: 'NAM',
    apiCategory: 'nam',
    description:
      'Thời trang thể thao nam hiệu suất cao — được thiết kế để đồng hành cùng bạn qua mọi buổi tập. ' +
      'Từ áo tank top thoáng khí đến quần jogger co giãn tối đa, mỗi sản phẩm đều tối ưu hoá cho hiệu suất và phong cách.',
    relatedTags: [
      { label: 'Áo Thể Thao Nam', slug: '/collections/nam/ao-t-shirt' },
      { label: 'Quần Short', slug: '/collections/nam/quan-short' },
      { label: 'Áo Hoodie', slug: '/collections/nam/ao-hoodie' },
      { label: 'Bộ Sưu Tập LEGACY', slug: '/collections/nam/legacy' },
      { label: 'Sale', slug: '/collections/nam/sale' },
    ],
    filters: {
      categories: ['Áo', 'Quần', 'Bộ đồ'],
      collections: ['LEGACY', 'STUDIO', 'GS POWER'],
    },
  },

  // ── NỮ ─────────────────────────────────────────────────────────────────────
  {
    slug: 'nu',
    name: 'NỮ',
    apiCategory: 'nu',
    description:
      'Bộ sưu tập thể thao nữ — kết hợp hoàn hảo giữa phong cách và hiệu suất. ' +
      'Sports bra, legging, áo crop top và hơn thế nữa: mỗi thiết kế ôm sát cơ thể, hỗ trợ tối đa và tự tin tuyệt đối trong mọi buổi tập.',
    relatedTags: [
      { label: 'Sports Bra', slug: '/collections/nu/sports-bra' },
      { label: 'Quần Legging', slug: '/collections/nu/quan-legging' },
      { label: 'Áo Crop Top', slug: '/collections/nu/ao-crop-top' },
      { label: 'Bộ Sưu Tập VITAL', slug: '/collections/nu/vital' },
      { label: 'Sale', slug: '/collections/nu/sale' },
    ],
    filters: {
      categories: ['Sports Bra', 'Áo', 'Quần', 'Áo Hoodie'],
      collections: ['VITAL', 'EVERYDAY', 'GS POWER'],
    },
  },

  // ── PHỤ KIỆN ───────────────────────────────────────────────────────────────
  {
    slug: 'phu-kien',
    name: 'PHỤ KIỆN',
    apiCategory: 'phu-kien',
    description:
      'Phụ kiện tập luyện chuyên dụng — từ túi gym đến găng tay, dây kháng lực và đai lưng. ' +
      'Trang bị đầy đủ để chinh phục mọi thử thách trong phòng gym và ngoài trời.',
    relatedTags: [
      { label: 'Gym Bag', slug: '/collections/phu-kien/gym-bag' },
      { label: 'Găng Tay', slug: '/collections/phu-kien/gang-tay' },
      { label: 'Dây Kháng Lực', slug: '/collections/phu-kien/day-khang-luc' },
      { label: 'Vớ Thể Thao', slug: '/collections/phu-kien/vo-the-thao' },
      { label: 'Mới Nhất', slug: '/collections/phu-kien/moi-nhat' },
    ],
    filters: {
      categories: ['Túi & Balo', 'Thiết bị', 'Vớ & Đồ lót', 'Đầu & Cổ'],
      collections: [],
    },
  },

  // ── SUB-COLLECTIONS (NAM) ──────────────────────────────────────────────────
  {
    slug: 'nam/ao-t-shirt',
    name: 'ÁO T-SHIRT NAM',
    apiCategory: 'nam',
    description: 'Áo T-Shirt nam thể thao — chất liệu thoáng khí, co giãn bốn chiều, thấm hút mồ hôi tốt.',
    relatedTags: [
      { label: 'Tất cả sản phẩm Nam', slug: '/collections/nam' },
      { label: 'Áo Tank Top', slug: '/collections/nam/ao-tank-top' },
      { label: 'Áo Hoodie', slug: '/collections/nam/ao-hoodie' },
    ],
    filters: { categories: ['Áo'], collections: ['LEGACY', 'STUDIO', 'GS POWER'] },
  },
  {
    slug: 'nam/ao-hoodie',
    name: 'ÁO HOODIE NAM',
    apiCategory: 'nam',
    description: 'Áo Hoodie nam — thiết kế oversized thoải mái, giữ ấm tốt, phù hợp cho tập luyện và đường phố.',
    relatedTags: [
      { label: 'Tất cả sản phẩm Nam', slug: '/collections/nam' },
      { label: 'Áo Zip', slug: '/collections/nam/ao-zip' },
    ],
    filters: { categories: ['Áo'], collections: ['LEGACY', 'STUDIO'] },
  },
  {
    slug: 'nam/quan-short',
    name: 'QUẦN SHORT NAM',
    apiCategory: 'nam',
    description: 'Quần short nam thể thao — độ co giãn cao, thoáng khí, lý tưởng cho tập gym và chạy bộ.',
    relatedTags: [
      { label: 'Tất cả sản phẩm Nam', slug: '/collections/nam' },
      { label: 'Quần Jogger', slug: '/collections/nam/quan-jogger' },
      { label: 'Quần Legging Nam', slug: '/collections/nam/quan-legging-nam' },
    ],
    filters: { categories: ['Quần'], collections: ['LEGACY', 'GS POWER'] },
  },
  {
    slug: 'nam/legacy',
    name: 'BỘ SƯU TẬP LEGACY',
    apiCategory: 'nam',
    description: 'LEGACY — bộ sưu tập nam huyền thoại với chất liệu cao cấp, thiết kế tối giản và hiệu suất đỉnh cao.',
    relatedTags: [
      { label: 'Tất cả sản phẩm Nam', slug: '/collections/nam' },
      { label: 'STUDIO', slug: '/collections/nam/studio' },
      { label: 'GS POWER', slug: '/collections/nam/gs-power' },
    ],
    filters: { categories: ['Áo', 'Quần'], collections: ['LEGACY'] },
  },
  {
    slug: 'nam/sale',
    name: 'SALE — NAM',
    apiCategory: 'nam',
    description: 'Sản phẩm nam giảm giá — cơ hội sở hữu thời trang thể thao chất lượng cao với giá ưu đãi.',
    relatedTags: [
      { label: 'Tất cả sản phẩm Nam', slug: '/collections/nam' },
      { label: 'Sale Nữ', slug: '/collections/nu/sale' },
    ],
    filters: { categories: ['Áo', 'Quần'], collections: ['LEGACY', 'STUDIO', 'GS POWER'] },
  },

  // ── SUB-COLLECTIONS (NỮ) ──────────────────────────────────────────────────
  {
    slug: 'nu/sports-bra',
    name: 'SPORTS BRA',
    apiCategory: 'nu',
    description: 'Sports Bra — hỗ trợ tối đa, kiểu dáng thời trang, phù hợp mọi cường độ tập luyện từ yoga đến HIIT.',
    relatedTags: [
      { label: 'Tất cả sản phẩm Nữ', slug: '/collections/nu' },
      { label: 'Áo Crop Top', slug: '/collections/nu/ao-crop-top' },
      { label: 'Quần Legging', slug: '/collections/nu/quan-legging' },
    ],
    filters: { categories: ['Sports Bra'], collections: ['VITAL', 'EVERYDAY', 'GS POWER'] },
  },
  {
    slug: 'nu/quan-legging',
    name: 'QUẦN LEGGING NỮ',
    apiCategory: 'nu',
    description: 'Quần Legging nữ — ôm sát cơ thể, co giãn hoàn hảo, chất liệu không thấu, đồng hành mọi buổi tập.',
    relatedTags: [
      { label: 'Tất cả sản phẩm Nữ', slug: '/collections/nu' },
      { label: 'Sports Bra', slug: '/collections/nu/sports-bra' },
      { label: 'Quần Short Nữ', slug: '/collections/nu/quan-short-nu' },
    ],
    filters: { categories: ['Quần'], collections: ['VITAL', 'EVERYDAY', 'GS POWER'] },
  },
  {
    slug: 'nu/vital',
    name: 'BỘ SƯU TẬP VITAL',
    apiCategory: 'nu',
    description: 'VITAL — bộ sưu tập nữ nổi bật nhất của FITMART. Thiết kế mềm mại, ôm sát, mang lại cảm giác tự tin và thoải mái tuyệt đối.',
    relatedTags: [
      { label: 'Tất cả sản phẩm Nữ', slug: '/collections/nu' },
      { label: 'EVERYDAY', slug: '/collections/nu/everyday' },
      { label: 'GS POWER', slug: '/collections/nu/gs-power' },
    ],
    filters: { categories: ['Sports Bra', 'Áo', 'Quần'], collections: ['VITAL'] },
  },
  {
    slug: 'nu/sale',
    name: 'SALE — NỮ',
    apiCategory: 'nu',
    description: 'Sản phẩm nữ giảm giá — cơ hội sở hữu thời trang thể thao chất lượng cao với giá ưu đãi.',
    relatedTags: [
      { label: 'Tất cả sản phẩm Nữ', slug: '/collections/nu' },
      { label: 'Sale Nam', slug: '/collections/nam/sale' },
    ],
    filters: { categories: ['Sports Bra', 'Áo', 'Quần'], collections: ['VITAL', 'EVERYDAY', 'GS POWER'] },
  },

  // ── PHỤ KIỆN SUB ──────────────────────────────────────────────────────────
  {
    slug: 'phu-kien/gym-bag',
    name: 'GYM BAG',
    apiCategory: 'phu-kien',
    description: 'Túi gym chuyên dụng — thiết kế thực dụng với nhiều ngăn chứa, chất liệu bền bỉ, phong cách tối giản.',
    relatedTags: [
      { label: 'Tất cả Phụ kiện', slug: '/collections/phu-kien' },
      { label: 'Túi Duffel', slug: '/collections/phu-kien/tui-duffel' },
      { label: 'Balo Tập', slug: '/collections/phu-kien/balo-tap' },
    ],
    filters: { categories: ['Túi & Balo'], collections: [] },
  },
];

/**
 * Lookup helper — returns config for a given full slug (e.g. "nu" or "nam/ao-hoodie").
 * Falls back to a generated config if the slug is not found.
 */
export function getCollectionConfig(slug) {
  const found = COLLECTION_CONFIG.find((c) => c.slug === slug);
  if (found) return found;

  // Auto-generate a minimal config for unknown sub-slugs
  const parts = (slug || '').split('/');
  const parentSlug = parts[0];
  const parent = COLLECTION_CONFIG.find((c) => c.slug === parentSlug);
  return {
    slug,
    name: slug.replace(/-/g, ' ').toUpperCase(),
    apiCategory: parent?.apiCategory ?? parentSlug ?? 'nam',
    description: '',
    relatedTags: parent ? [{ label: `Tất cả ${parent.name}`, slug: `/collections/${parentSlug}` }] : [],
    filters: parent?.filters ?? { categories: [], collections: [] },
  };
}
