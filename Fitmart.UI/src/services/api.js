/**
 * api.js — Centralized API service
 * Base URL: VITE_API_URL env var or http://localhost:5049
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5049';
export const API_BASE = BASE;

/* ─── Core fetch wrapper ─── */
async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = { ...options.headers };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach token if present
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
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
    request('/api/products', {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),

  update: (id, body) =>
    request(`/api/products/${id}`, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),

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
  // GET /api/orders — lấy danh sách đơn hàng (admin)
  getAll: () => request('/api/orders'),

  // GET /api/orders/my-orders — lấy danh sách đơn hàng của khách hàng hiện tại
  getMyOrders: (userId) => request(`/api/orders/my-orders?userId=${userId}`),

  // POST /api/orders — dùng cho storefront, không phải admin
  create: (body) =>
    request('/api/orders', { method: 'POST', body: JSON.stringify(body) }),

  // PUT /api/orders/:id/status — cập nhật trạng thái đơn hàng (admin hoặc khách hàng hủy)
  updateStatus: (id, status) =>
    request(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

/* ═══════════════════════════════════════════
   USERS  — /api/users (chưa có backend controller)
   Dùng mock, sẵn sàng swap khi có endpoint.
   ═══════════════════════════════════════════ */
export const usersApi = {
  getAll: () => request('/api/users'),
  updateRole: (id, role) => request(`/api/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
  updateStatus: (id, status) => Promise.resolve({ id, status }), // TODO: thêm endpoint khi cần
};

/* ═══════════════════════════════════════════
   DASHBOARD  — /api/dashboard
   ═══════════════════════════════════════════ */
export const dashboardApi = {
  /** Lấy toàn bộ thống kê cho trang Dashboard admin */
  getStats: () => request('/api/dashboard/stats'),
};

/* ═══════════════════════════════════════════
   AUTH  — /api/users/register & /api/users/login
   ═══════════════════════════════════════════ */
export const authApi = {
  /**
   * Đăng ký tài khoản mới.
   * @param {{ fullName: string, email: string, password: string }} body
   * @returns {Promise<{ token: string, userId: number, name: string, email: string, role: string }>}
   */
  register: (body) =>
    request('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /**
   * Đăng nhập.
   * @param {{ email: string, password: string }} body
   * @returns {Promise<{ token: string, userId: number, name: string, email: string, role: string }>}
   */
  login: (body) =>
    request('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

/* ═══════════════════════════════════════════
   CHAT  — /api/chat
   ═══════════════════════════════════════════ */
export const chatApi = {
  /** Lấy danh sách phòng chat (Admin only) */
  getRooms: () => request('/api/chat/rooms'),

  /** Lấy lịch sử tin nhắn trong 1 phòng */
  getMessages: (roomId) => request(`/api/chat/rooms/${encodeURIComponent(roomId)}/messages`),

  /** Đánh dấu đã đọc (Admin) */
  markAsRead: (roomId) =>
    request(`/api/chat/rooms/${encodeURIComponent(roomId)}/read`, { method: 'PUT' }),
};

/* ═══════════════════════════════════════════
   WISHLIST  — /api/wishlist
   Tất cả endpoint yêu cầu JWT (Authorize)
   ═══════════════════════════════════════════ */
export const wishlistApi = {
  /** Lấy danh sách sản phẩm yêu thích (kèm product detail) */
  getAll: () => request('/api/wishlist'),

  /** Lấy danh sách productId đã yêu thích (để hiển thị tim đỏ) */
  getIds: () => request('/api/wishlist/ids'),

  /** Thêm sản phẩm vào yêu thích */
  add: (productId) =>
    request(`/api/wishlist/${productId}`, { method: 'POST' }),

  /** Xóa sản phẩm khỏi yêu thích */
  remove: (productId) =>
    request(`/api/wishlist/${productId}`, { method: 'DELETE' }),
};
