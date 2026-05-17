import React from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './admin.css';

/* ─── Menu items ─── */
const menuItems = [
  { icon: '📊', label: 'Tổng quan',   path: '/admin',            end: true },
  { icon: '📦', label: 'Sản phẩm',    path: '/admin/products',   end: false },
  { icon: '🛍️', label: 'Đơn hàng',    path: '/admin/orders',     end: false },
  { icon: '👥', label: 'Người dùng',  path: '/admin/users',      end: false },
  { icon: '🏷️', label: 'Danh mục',    path: '/admin/categories', end: false },
];

/**
 * AdminLayout
 * Wraps all /admin/* routes with a fixed sidebar + scrollable content area.
 * Redirects non-admin users to /login.
 */
export default function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  /* ── Route protection ── */
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role && user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">FITMART</div>

        <nav className="admin-sidebar__nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `admin-sidebar__item${isActive ? ' admin-sidebar__item--active' : ''}`
              }
            >
              <span className="admin-sidebar__item-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <span className="admin-sidebar__user-name">
              {user?.name || 'Admin'}
            </span>
            <span className="admin-sidebar__user-role">Quản trị viên</span>
          </div>
          <button className="admin-sidebar__logout" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Content ── */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
