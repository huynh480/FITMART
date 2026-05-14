import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FacebookFilled, InstagramFilled, YoutubeFilled } from '@ant-design/icons';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      return;
    }
    setError('');
    // Mock success
    alert('Đăng ký thành công!');
    setEmail('');
  };

  // Link styles are handled via a <style> block at the bottom of the component

  const headerStyle = {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '1.5px',
    color: '#ffffff',
    textTransform: 'uppercase',
    marginBottom: '16px',
    marginTop: 0,
    fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
  };

  const badgeStyle = {
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '4px 8px',
    fontSize: '11px',
    borderRadius: '4px',
    color: '#9e9e9e',
    fontWeight: 500,
    background: 'transparent',
    display: 'inline-block',
  };

  return (
    <footer style={{ fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif", textAlign: 'left', backgroundColor: '#111111' }}>
      {/* ─── PHẦN 1: Email Subscribe Banner ─── */}
      <div style={{ padding: '40px 0', width: '100%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
          
          {/* Cột trái */}
          <div style={{ textAlign: 'left', color: '#ffffff', flex: '1 1 300px' }}>
            <h3 style={{ color: '#ffffff', textTransform: 'uppercase', margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700 }}>Nhận ưu đãi độc quyền</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#9e9e9e' }}>Đăng ký để nhận thông tin sản phẩm mới và khuyến mãi</p>
          </div>
          
          {/* Cột phải */}
          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flex: '1 1 300px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                style={{
                  padding: '0 16px',
                  width: '100%',
                  height: '48px',
                  border: error ? '1px solid #ff4d4f' : 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {error && <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px', position: 'absolute', bottom: '-20px', left: '0' }}>{error}</div>}
            </div>
            <button
              type="submit"
              style={{
                backgroundColor: '#ffffff',
                color: '#000000',
                padding: '0 24px',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 200ms ease',
                height: '48px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e5e5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              ĐĂNG KÝ
            </button>
          </form>

        </div>
      </div>

      {/* ─── PHẦN 2: Footer Main ─── */}
      <div style={{ padding: '60px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
          
          {/* Cột 1 — Brand */}
          <div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '1px', color: '#ffffff' }}>FITMART</div>
            <p style={{ fontSize: '14px', color: '#9e9e9e', lineHeight: '1.6', marginBottom: '24px' }}>
              Trang bị hoàn hảo cho mọi bài tập.<br />
              Từ tạ đơn đến đồ tập cao cấp.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'flex-start' }}>
              <FacebookFilled className="social-icon" />
              <InstagramFilled className="social-icon" />
              <YoutubeFilled className="social-icon" />
            </div>
          </div>

          {/* Cột 2 — Mua sắm */}
          <div>
            <p style={headerStyle}>MUA SẮM</p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {['Nam', 'Nữ', 'Phụ kiện', 'Bộ sưu tập mới', 'Sale'].map(link => (
                <Link key={link} to={`/collections/${link.toLowerCase().replace(/ /g, '-')}`} className="footer-link">
                  {link}
                </Link>
              ))}
            </div>
          </div>

          {/* Cột 3 — Hỗ trợ */}
          <div>
            <p style={headerStyle}>HỖ TRỢ</p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {['Về chúng tôi', 'Chính sách đổi trả', 'Hướng dẫn chọn size', 'Liên hệ'].map(link => (
                <Link key={link} to={`/support/${link.toLowerCase().replace(/ /g, '-')}`} className="footer-link">
                  {link}
                </Link>
              ))}
            </div>
          </div>

          {/* Cột 4 — Thông tin */}
          <div>
            <p style={headerStyle}>THÔNG TIN</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#ffffff', lineHeight: '2' }}>
              <div>Hotline: <span style={{ fontWeight: 500 }}>1800 xxxx</span></div>
              <div>Email: <span style={{ fontWeight: 500 }}>support@fitmart.vn</span></div>
              <div>Giờ làm việc: <span style={{ fontWeight: 500 }}>8:00 - 22:00</span></div>
            </div>
          </div>

        </div>
      </div>

      {/* ─── PHẦN 3: Footer Bottom ─── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '20px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '12px', color: '#9e9e9e' }}>
            © 2025 FITMART. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['VISA', 'MASTERCARD', 'MOMO', 'ZALOPAY'].map(badge => (
              <span key={badge} style={badgeStyle}>{badge}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .footer-link {
          color: #9e9e9e;
          font-size: 14px;
          line-height: 2;
          text-decoration: none !important;
          display: inline-block;
          transition: color 125ms ease, text-decoration 125ms ease;
        }
        .footer-link:hover {
          color: #ffffff;
          text-decoration: underline !important;
        }
        .social-icon {
          color: #9e9e9e;
          font-size: 20px;
          cursor: pointer;
          transition: color 200ms ease;
        }
        .social-icon:hover {
          color: #ffffff;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
