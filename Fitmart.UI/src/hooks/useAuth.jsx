import React, { useState, useContext, createContext } from 'react';
import authConfig from '../config/authConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  /* ── Khởi tạo state đồng bộ từ localStorage để tránh flash redirect ── */
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!(localStorage.getItem('token') && localStorage.getItem('user'));
  });

  const login = async (email, password) => {
    try {
      // Giả lập API call (mocking vì chưa có backend)
      return new Promise((resolve) => {
        setTimeout(() => {
          // Admin account
          if (email === 'admin@fitmart.vn' && password === 'admin123') {
            const mockUser = { id: 0, name: 'Admin FITMART', email, role: 'admin' };
            localStorage.setItem('token', 'mock_jwt_token_admin');
            localStorage.setItem('user', JSON.stringify(mockUser));
            setUser(mockUser);
            setIsAuthenticated(true);
            resolve({ success: true });
          // Regular user account
          } else if (email === 'test@fitmart.vn' && password === '123456') {
            const mockUser = { id: 1, name: 'Nguyễn Văn Test', email, role: 'user' };
            localStorage.setItem('token', 'mock_jwt_token_abc123');
            localStorage.setItem('user', JSON.stringify(mockUser));
            setUser(mockUser);
            setIsAuthenticated(true);
            resolve({ success: true });
          } else {
            resolve({ success: false, error: 'Email hoặc mật khẩu không chính xác' });
          }
        }, 1000);
      });

      /* 
      // Thực tế khi tích hợp backend:
      const response = await fetch(authConfig.endpoints.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Đăng nhập thất bại');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
      */
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (fullName, email, password) => {
    try {
      // Giả lập API call
      return new Promise((resolve) => {
        setTimeout(() => {
          if (email && password && fullName) {
            const mockUser = { id: 2, name: fullName, email };
            localStorage.setItem('token', 'mock_jwt_token_xyz890');
            localStorage.setItem('user', JSON.stringify(mockUser));
            setUser(mockUser);
            setIsAuthenticated(true);
            resolve({ success: true });
          } else {
            resolve({ success: false, error: 'Vui lòng điền đầy đủ thông tin' });
          }
        }, 1000);
      });
      
      /*
      // Thực tế khi tích hợp backend:
      const response = await fetch(authConfig.endpoints.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Đăng ký thất bại');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
      */
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
