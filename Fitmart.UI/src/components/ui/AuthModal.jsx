import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeOutlined, EyeInvisibleOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';

const AuthModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const { login, register } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset form when modal closes or changes tab
  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setActiveTab('login');
        resetForm();
      }, 300);
    }
  }, [isOpen]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setConfirmPassword('');
    setError(null);
    setLoading(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (activeTab === 'login') {
      if (!email || !password) {
        setError('Vui lòng nhập đầy đủ email và mật khẩu');
        setLoading(false);
        return;
      }
      const res = await login(email, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Đăng nhập thất bại');
      }
    } else {
      if (!fullName || !email || !password || !confirmPassword) {
        setError('Vui lòng điền đầy đủ thông tin');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        setLoading(false);
        return;
      }
      const res = await register(fullName, email, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Đăng ký thất bại');
      }
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
            }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              zIndex: 1000,
              overflow: 'hidden',
              fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#6e6e6e',
                zIndex: 10,
              }}
              aria-label="Đóng"
            >
              <CloseOutlined />
            </button>

            {/* Tabs Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e5e5', paddingTop: '20px' }}>
              <button
                onClick={() => handleTabChange('login')}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'login' ? '2px solid #1b1b1b' : '2px solid transparent',
                  padding: '12px 0',
                  fontSize: '16px',
                  fontWeight: activeTab === 'login' ? 600 : 500,
                  color: activeTab === 'login' ? '#1b1b1b' : '#6e6e6e',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                ĐĂNG NHẬP
              </button>
              <button
                onClick={() => handleTabChange('register')}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'register' ? '2px solid #1b1b1b' : '2px solid transparent',
                  padding: '12px 0',
                  fontSize: '16px',
                  fontWeight: activeTab === 'register' ? 600 : 500,
                  color: activeTab === 'register' ? '#1b1b1b' : '#6e6e6e',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                ĐĂNG KÝ
              </button>
            </div>

            {/* Form Content */}
            <div style={{ padding: '32px 24px' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeTab === 'register' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 500, color: '#1b1b1b' }}>Họ và tên</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nhập họ và tên"
                      style={{
                        padding: '12px 16px',
                        border: '1px solid #e5e5e5',
                        borderRadius: '4px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#1b1b1b')}
                      onBlur={(e) => (e.target.style.borderColor = '#e5e5e5')}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#1b1b1b' }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '4px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#1b1b1b')}
                    onBlur={(e) => (e.target.style.borderColor = '#e5e5e5')}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#1b1b1b' }}>Mật khẩu</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      style={{
                        width: '100%',
                        padding: '12px 40px 12px 16px',
                        border: '1px solid #e5e5e5',
                        borderRadius: '4px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#1b1b1b')}
                      onBlur={(e) => (e.target.style.borderColor = '#e5e5e5')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6e6e6e',
                        padding: 0,
                        display: 'flex'
                      }}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    </button>
                  </div>
                </div>

                {activeTab === 'register' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 500, color: '#1b1b1b' }}>Xác nhận mật khẩu</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu"
                        style={{
                          width: '100%',
                          padding: '12px 40px 12px 16px',
                          border: '1px solid #e5e5e5',
                          borderRadius: '4px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#1b1b1b')}
                        onBlur={(e) => (e.target.style.borderColor = '#e5e5e5')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6e6e6e',
                          padding: 0,
                          display: 'flex'
                        }}
                      >
                        {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'login' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <a href="#" style={{ fontSize: '13px', color: '#6e6e6e', textDecoration: 'underline' }}>
                      Quên mật khẩu?
                    </a>
                  </div>
                )}

                {error && (
                  <div style={{ color: '#d93025', fontSize: '13px', marginTop: '-4px', marginBottom: '4px' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    backgroundColor: '#1b1b1b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    opacity: loading ? 0.8 : 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '8px'
                  }}
                  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#333333')}
                  onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#1b1b1b')}
                >
                  {loading && <LoadingOutlined />}
                  {activeTab === 'login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}
                </button>
              </form>

              {activeTab === 'login' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0 16px' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e5e5' }}></div>
                    <span style={{ padding: '0 12px', fontSize: '13px', color: '#6e6e6e' }}>hoặc</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e5e5' }}></div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '14px', color: '#1b1b1b' }}>
                    Chưa có tài khoản?{' '}
                    <button
                      onClick={() => handleTabChange('register')}
                      style={{ background: 'none', border: 'none', padding: 0, color: '#1b1b1b', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Đăng ký
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', fontSize: '14px', color: '#1b1b1b', marginTop: '24px' }}>
                  Đã có tài khoản?{' '}
                  <button
                    onClick={() => handleTabChange('login')}
                    style={{ background: 'none', border: 'none', padding: 0, color: '#1b1b1b', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Đăng nhập
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
