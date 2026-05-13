import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { EyeOutlined, EyeInvisibleOutlined, LoadingOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu');
      setLoading(false);
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      // Redirect to previous page or home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Đăng nhập thất bại');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Left Column - Image */}
      <div style={{ flex: '0 0 50%' }} className="auth-img-col">
        <img 
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop" 
          alt="Gym workout" 
          style={{ width: '100%', height: '100vh', objectFit: 'cover', display: 'block' }} 
        />
      </div>

      {/* Right Column - Form */}
      <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', padding: '60px 48px', backgroundColor: '#ffffff', overflowY: 'auto' }}>
        <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          
          <Link to="/" style={{ alignSelf: 'center', fontSize: '24px', fontWeight: 900, color: '#1b1b1b', textDecoration: 'none', letterSpacing: '3px', marginBottom: '60px' }}>
            FITMART
          </Link>

          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1b1b1b', marginBottom: '8px', textAlign: 'center' }}>Đăng nhập</h1>
          <p style={{ fontSize: '15px', color: '#6e6e6e', textAlign: 'center', marginBottom: '40px' }}>Chào mừng bạn trở lại</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', color: '#1b1b1b', fontWeight: 500, textAlign: 'left' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                style={{
                  padding: '12px 16px',
                  border: error ? '1px solid red' : '1px solid #e5e5e5',
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  color: '#1b1b1b',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                  width: '100%'
                }}
                onFocus={(e) => !error && (e.target.style.borderColor = '#000')}
                onBlur={(e) => !error && (e.target.style.borderColor = '#e5e5e5')}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', color: '#1b1b1b', fontWeight: 500, textAlign: 'left' }}>Mật khẩu</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 16px',
                    border: error ? '1px solid red' : '1px solid #e5e5e5',
                    borderRadius: '4px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    color: '#1b1b1b',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => !error && (e.target.style.borderColor = '#000')}
                  onBlur={(e) => !error && (e.target.style.borderColor = '#e5e5e5')}
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
                >
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ color: 'red', fontSize: '13px', marginTop: '-12px' }}>
                {error}
              </div>
            )}

            {/* Forgot Password */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' }}>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  message.info('Vui lòng liên hệ admin@fitmart.vn để được hỗ trợ');
                }} 
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '13px', color: '#6e6e6e', textDecoration: 'underline', fontFamily: 'inherit' }}
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '52px',
                backgroundColor: '#1b1b1b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
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
              ĐĂNG NHẬP
            </button>
            
          </form>

          <div style={{ textAlign: 'center', fontSize: '14px', color: '#1b1b1b', marginTop: '24px' }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: '#1b1b1b', textDecoration: 'underline' }}>
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .auth-img-col {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
