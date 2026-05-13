/**
 * productData.js
 * Mock data for Product Detail Page.
 * Single source of truth for product detail testing.
 */

export const PRODUCT_DETAIL_DATA = {
  id: 'prod-001',
  slug: 'ao-the-thao-nam',
  name: 'Áo Thể Thao Nam LEGACY Performance',
  collectionName: 'LEGACY',
  price: 890000,
  salePrice: 649000,
  rating: 4.7,
  reviewCount: 238,
  description:
    'Áo thể thao nam LEGACY Performance được thiết kế để đáp ứng các nhu cầu tập luyện cường độ cao. ' +
    'Công nghệ DryTech™ thấm hút mồ hôi vượt trội, giữ bạn khô ráo và thoải mái trong suốt buổi tập. ' +
    'Đường may phẳng chống chà xát, thiết kế ergonomic theo dáng cơ thể giúp bạn tự tin tối đa hiệu suất.',
  material:
    '88% Polyester tái chế, 12% Elastane. Vải DryTech™ co giãn 4 chiều, thoáng khí, chống tia UV UPF 40+. ' +
    'Trọng lượng vải: 180gsm. Sản xuất tại Việt Nam theo tiêu chuẩn OEKO-TEX®.',
  careInstructions:
    'Giặt máy ở nhiệt độ ≤ 30°C. Không dùng thuốc tẩy. Không sấy khô bằng máy. ' +
    'Phơi nơi thoáng mát, tránh ánh nắng trực tiếp. Không ủi. Có thể giặt khô.',

  colors: [
    {
      id: 'color-black',
      name: 'Đen Tuyền',
      hex: '#1b1b1b',
      images: [
        'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
        'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80',
        'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&q=80',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
      ],
    },
    {
      id: 'color-charcoal',
      name: 'Xám Đậm',
      hex: '#4a4a4a',
      images: [
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
        'https://images.unsplash.com/photo-1536766768598-e09213fdcf22?w=800&q=80',
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80',
      ],
    },
    {
      id: 'color-slate',
      name: 'Xanh Đá',
      hex: '#546e7a',
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
        'https://images.unsplash.com/photo-1600861194802-a2b11076bc51?w=800&q=80',
        'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&q=80',
      ],
    },
    {
      id: 'color-white',
      name: 'Trắng Sữa',
      hex: '#f5f5f0',
      images: [
        'https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=800&q=80',
        'https://images.unsplash.com/photo-1503341338985-95803d9b1ec2?w=800&q=80',
        'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&q=80',
      ],
    },
  ],

  sizes: [
    { label: 'XS', inStock: true },
    { label: 'S', inStock: true },
    { label: 'M', inStock: true },
    { label: 'L', inStock: true },
    { label: 'XL', inStock: false },
    { label: 'XXL', inStock: false },
  ],

  relatedProducts: [
    {
      id: 'rel-001',
      slug: 'quan-short-nam-legacy',
      image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&q=80',
      productName: 'Quần Short Nam LEGACY Training',
      collectionName: 'LEGACY',
      price: '590.000 ₫',
      isOutOfStock: false,
    },
    {
      id: 'rel-002',
      slug: 'ao-hoodie-nam-studio',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      productName: 'Áo Hoodie Nam STUDIO Oversized',
      collectionName: 'STUDIO',
      price: '1.250.000 ₫',
      isOutOfStock: false,
    },
    {
      id: 'rel-003',
      slug: 'ao-tank-top-nam-gs-power',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
      productName: 'Áo Tank Top Nam GS POWER',
      collectionName: 'GS POWER',
      price: '490.000 ₫',
      isOutOfStock: false,
    },
    {
      id: 'rel-004',
      slug: 'quan-jogger-nam-legacy',
      image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80',
      productName: 'Quần Jogger Nam LEGACY Slim',
      collectionName: 'LEGACY',
      price: '790.000 ₫',
      isOutOfStock: true,
    },
  ],
};

/** Lookup by slug – extendable for multi-product catalog */
export function getProductBySlug(slug) {
  if (slug === PRODUCT_DETAIL_DATA.slug) return PRODUCT_DETAIL_DATA;
  return null;
}

/** Format VND price */
export function formatPrice(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
