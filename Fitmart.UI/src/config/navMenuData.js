/**
 * navMenuData.js
 * Centralized config for FITMART Navbar Mega Menu (sidebar style).
 *
 * Each top-level item (NAM / NỮ / PHỤ KIỆN) has:
 *   - groups[]  : left-panel items. Each group has a label + links[].
 *                 The first group is shown by default when the menu opens.
 *   - featuredImage / featuredImageAlt : Zone 3 lifestyle image.
 *   - ctaLabel / ctaHref : "View all" link (used in mobile drawer).
 *
 * DO NOT hardcode any of this content in JSX.
 */

const navMenuData = [
  {
    id: 'nam',
    label: 'NAM',
    ariaLabel: 'Menu danh mục Nam',
    featuredImage: '/mega_menu_nam.png',
    featuredImageAlt: 'Bộ sưu tập thời trang thể thao nam FITMART',
    ctaLabel: 'Xem tất cả sản phẩm Nam →',
    ctaHref: '/collections/nam',
    groups: [
      {
        id: 'nam-xu-huong',
        label: 'Xu hướng',
        links: [
          { label: 'Mới nhất', href: '/collections/nam/moi-nhat' },
          { label: 'Bán chạy nhất', href: '/collections/nam/ban-chay-nhat' },
          { label: 'Ưu đãi đặc biệt', href: '/collections/nam/uu-dai' },
        ],
      },
      {
        id: 'nam-ao',
        label: 'Áo',
        links: [
          { label: 'Áo T-Shirt', href: '/collections/nam/ao-t-shirt' },
          { label: 'Áo Tank Top', href: '/collections/nam/ao-tank-top' },
          { label: 'Áo Hoodie', href: '/collections/nam/ao-hoodie' },
          { label: 'Áo Zip', href: '/collections/nam/ao-zip' },
        ],
      },
      {
        id: 'nam-quan',
        label: 'Quần',
        links: [
          { label: 'Quần Short', href: '/collections/nam/quan-short' },
          { label: 'Quần Jogger', href: '/collections/nam/quan-jogger' },
          { label: 'Quần Legging Nam', href: '/collections/nam/quan-legging-nam' },
        ],
      },
      {
        id: 'nam-bst',
        label: 'Bộ sưu tập',
        links: [
          { label: 'LEGACY', href: '/collections/nam/legacy' },
          { label: 'STUDIO', href: '/collections/nam/studio' },
          { label: 'GS POWER', href: '/collections/nam/gs-power' },
        ],
      },
      {
        id: 'nam-sale',
        label: 'Sale',
        links: [
          { label: 'Hàng giảm giá', href: '/collections/nam/sale' },
          { label: 'Hàng tồn kho', href: '/collections/nam/ton-kho' },
        ],
      },
    ],
  },
  {
    id: 'nu',
    label: 'NỮ',
    ariaLabel: 'Menu danh mục Nữ',
    featuredImage: '/mega_menu_nu.png',
    featuredImageAlt: 'Bộ sưu tập thời trang thể thao nữ FITMART',
    ctaLabel: 'Xem tất cả sản phẩm Nữ →',
    ctaHref: '/collections/nu',
    groups: [
      {
        id: 'nu-xu-huong',
        label: 'Xu hướng',
        links: [
          { label: 'Mới nhất', href: '/collections/nu/moi-nhat' },
          { label: 'Bán chạy nhất', href: '/collections/nu/ban-chay-nhat' },
          { label: 'Ưu đãi đặc biệt', href: '/collections/nu/uu-dai' },
        ],
      },
      {
        id: 'nu-ao',
        label: 'Áo',
        links: [
          { label: 'Sports Bra', href: '/collections/nu/sports-bra' },
          { label: 'Áo Crop Top', href: '/collections/nu/ao-crop-top' },
          { label: 'Áo Hoodie Nữ', href: '/collections/nu/ao-hoodie-nu' },
          { label: 'Áo Tank Nữ', href: '/collections/nu/ao-tank-nu' },
        ],
      },
      {
        id: 'nu-quan',
        label: 'Quần',
        links: [
          { label: 'Quần Legging', href: '/collections/nu/quan-legging' },
          { label: 'Quần Short Nữ', href: '/collections/nu/quan-short-nu' },
          { label: 'Quần Jogger Nữ', href: '/collections/nu/quan-jogger-nu' },
        ],
      },
      {
        id: 'nu-bst',
        label: 'Bộ sưu tập',
        links: [
          { label: 'VITAL', href: '/collections/nu/vital' },
          { label: 'EVERYDAY', href: '/collections/nu/everyday' },
          { label: 'GS POWER', href: '/collections/nu/gs-power' },
        ],
      },
      {
        id: 'nu-sale',
        label: 'Sale',
        links: [
          { label: 'Hàng giảm giá', href: '/collections/nu/sale' },
          { label: 'Hàng tồn kho', href: '/collections/nu/ton-kho' },
        ],
      },
    ],
  },
  {
    id: 'phu-kien',
    label: 'PHỤ KIỆN',
    ariaLabel: 'Menu danh mục Phụ kiện',
    featuredImage: '/mega_menu_phukien.png',
    featuredImageAlt: 'Phụ kiện tập luyện FITMART',
    ctaLabel: 'Xem tất cả phụ kiện →',
    ctaHref: '/collections/phu-kien',
    groups: [
      {
        id: 'pk-xu-huong',
        label: 'Xu hướng',
        links: [
          { label: 'Tất cả phụ kiện', href: '/collections/phu-kien' },
          { label: 'Mới nhất', href: '/collections/phu-kien/moi-nhat' },
          { label: 'Bán chạy nhất', href: '/collections/phu-kien/ban-chay-nhat' },
        ],
      },
      {
        id: 'pk-tui',
        label: 'Túi & Balo',
        links: [
          { label: 'Gym Bag', href: '/collections/phu-kien/gym-bag' },
          { label: 'Túi Duffel', href: '/collections/phu-kien/tui-duffel' },
          { label: 'Balo Tập', href: '/collections/phu-kien/balo-tap' },
        ],
      },
      {
        id: 'pk-thiet-bi',
        label: 'Thiết bị',
        links: [
          { label: 'Dây kháng lực', href: '/collections/phu-kien/day-khang-luc' },
          { label: 'Găng tay', href: '/collections/phu-kien/gang-tay' },
          { label: 'Đai lưng', href: '/collections/phu-kien/dai-lung' },
        ],
      },
      {
        id: 'pk-vo',
        label: 'Vớ & Đồ lót',
        links: [
          { label: 'Vớ thể thao', href: '/collections/phu-kien/vo-the-thao' },
          { label: 'Đồ lót thể thao', href: '/collections/phu-kien/do-lot' },
        ],
      },
      {
        id: 'pk-dau-co',
        label: 'Đầu & Cổ',
        links: [
          { label: 'Băng đầu', href: '/collections/phu-kien/bang-dau' },
          { label: 'Khăn cổ', href: '/collections/phu-kien/khan-co' },
        ],
      },
    ],
  },
];

export default navMenuData;
