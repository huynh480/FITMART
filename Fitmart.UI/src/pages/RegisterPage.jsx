import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeOutlined, EyeInvisibleOutlined, LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

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
      // Register success auto login and redirect
      navigate('/');
    } else {
      setError(res.error || 'Đăng ký thất bại');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Left Column - Image */}
      <div style={{ flex: '0 0 50%' }} className="auth-img-col">
        <img 
          src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop" 
          alt="Gym workout" 
          style={{ width: '100%', height: '100vh', objectFit: 'cover', display: 'block' }} 
        />
      </div>

      {/* Right Column - Form */}
      <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', padding: '60px 48px', backgroundColor: '#ffffff', overflowY: 'auto' }}>
        <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          
          <Link to="/" style={{ alignSelf: 'center', fontSize: '24px', fontWeight: 900, color: '#1b1b1b', textDecoration: 'none', letterSpacing: '3px', marginBottom: '40px' }}>
            FITMART
          </Link>

          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1b1b1b', marginBottom: '32px', textAlign: 'center' }}>Tạo tài khoản</h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Full Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', color: '#1b1b1b', fontWeight: 500, textAlign: 'left' }}>Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên"
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

            {/* Confirm Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', color: '#1b1b1b', fontWeight: 500, textAlign: 'left' }}>Xác nhận mật khẩu</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
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

            {/* Error Message */}
            {error && (
              <div style={{ color: 'red', fontSize: '13px', marginTop: '-12px' }}>
                {error}
              </div>
            )}

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
              ĐĂNG KÝ
            </button>
            
          </form>

          <div style={{ textAlign: 'center', fontSize: '14px', color: '#1b1b1b', marginTop: '24px' }}>
            Đã có tài khoản?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: '#1b1b1b', textDecoration: 'underline' }}>
              Đăng nhập
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

export default RegisterPage;
