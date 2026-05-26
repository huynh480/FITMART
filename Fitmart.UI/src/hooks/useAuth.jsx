import React, { useState, useContext, createContext } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  /* ── Khởi tạo state từ localStorage — tránh flash redirect khi reload ── */
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!(localStorage.getItem('token') && localStorage.getItem('user'))
  );

  /* ════════════════════════════════════════
     Lưu thông tin user và token vào state + localStorage
     ════════════════════════════════════════ */
  const _persist = (data) => {
    // data = { token, userId, name, email, role }
    const userObj = {
      id:    data.userId,
      name:  data.name,
      email: data.email,
      role:  data.role ? data.role.toLowerCase() : '',
    };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userObj));
    setUser(userObj);
    setIsAuthenticated(true);
  };

  /* ════════════════════════════════════════
     Đăng nhập
     ════════════════════════════════════════ */
  const login = async (email, password) => {
    try {
      const data = await authApi.login({ email, password });
      _persist(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Email hoặc mật khẩu không chính xác.' };
    }
  };

  /* ════════════════════════════════════════
     Đăng ký
     ════════════════════════════════════════ */
  const register = async (fullName, email, password) => {
    try {
      const data = await authApi.register({ fullName, email, password });
      _persist(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Đăng ký thất bại. Vui lòng thử lại.' };
    }
  };

  /* ════════════════════════════════════════
     Đăng xuất
     ════════════════════════════════════════ */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  /* ════════════════════════════════════════
     Helper — lấy token để đính kèm vào request có [Authorize]
     ════════════════════════════════════════ */
  const getToken = () => localStorage.getItem('token');

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
