/**
 * api.js — Centralized API service
 * Base URL: VITE_API_URL env var or http://localhost:5049
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5049';

/* ─── Core fetch wrapper ─── */
async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (res.status === 204) return null; // No Content (DELETE/PUT success)

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

/* ═══════════════════════════════════════════
   PRODUCTS  — /api/products
   GET  response shape: { totalItems, page, pageSize, totalPages, items: [...] }
   POST/PUT  body: Product model (see ProductsController)
   ═══════════════════════════════════════════ */
export const productsApi = {
  /** Lấy toàn bộ (pageSize=1000 để admin xem hết, không phân trang phía UI) */
  getAll: (params = {}) => {
    const qs = new URLSearchParams({ pageSize: 1000, ...params }).toString();
    return request(`/api/products?${qs}`);
  },

  getById: (id) => request(`/api/products/${id}`),

  create: (body) =>
    request('/api/products', { method: 'POST', body: JSON.stringify(body) }),

  update: (id, body) =>
    request(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  remove: (id) =>
    request(`/api/products/${id}`, { method: 'DELETE' }),

  /**
   * Upload ảnh lên server.
   * @param {File} file - File object từ input/Upload
   * @returns {{ imageUrl: string }} - URL tuyệt đối từ wwwroot
   */
  uploadImage: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE}/api/products/upload-image`, {
      method: 'POST',
      body: form,
      // Không set Content-Type — browser tự thêm boundary cho multipart
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message || `Upload thất bại (HTTP ${res.status})`);
    }
    return res.json(); // { imageUrl: "/images/products/xxx.jpg" }
  },
};

/* ═══════════════════════════════════════════
   CATEGORIES  — /api/categories
   GET  response: Category[]
   POST/PUT  body: { id, name, description, parentId?, slug? }
   ═══════════════════════════════════════════ */
export const categoriesApi = {
  getAll: () => request('/api/categories'),

  getById: (id) => request(`/api/categories/${id}`),

  /** Lấy danh mục theo slug — trả về Category | null */
  getBySlug: async (slug) => {
    const list = await request(`/api/categories?slug=${encodeURIComponent(slug)}`);
    return Array.isArray(list) && list.length > 0 ? list[0] : null;
  },

  create: (body) =>
    request('/api/categories', { method: 'POST', body: JSON.stringify(body) }),

  update: (id, body) =>
    request(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  remove: (id) =>
    request(`/api/categories/${id}`, { method: 'DELETE' }),
};

/* ═══════════════════════════════════════════
   ORDERS  — /api/orders
   NOTE: Backend hiện chỉ có POST (tạo đơn mới).
   Admin list/update dùng mock tạm, sẵn sàng khi API có thêm endpoint.
   ═══════════════════════════════════════════ */
export const ordersApi = {
  // Placeholder — thay thế khi backend có GET /api/orders (admin)
  getAll: () => Promise.resolve([]),

  // POST /api/orders — dùng cho storefront, không phải admin
  create: (body) =>
    request('/api/orders', { method: 'POST', body: JSON.stringify(body) }),

  // Placeholder cho PUT /api/orders/:id/status
  updateStatus: (id, status) => Promise.resolve({ id, status }),
};

/* ═══════════════════════════════════════════
   USERS  — /api/users (chưa có backend controller)
   Dùng mock, sẵn sàng swap khi có endpoint.
   ═══════════════════════════════════════════ */
export const usersApi = {
  getAll: () => Promise.resolve([]),
  updateRole: (id, role) => Promise.resolve({ id, role }),
  updateStatus: (id, status) => Promise.resolve({ id, status }),
};
