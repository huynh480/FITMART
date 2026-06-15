import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { message, Spin } from 'antd';
import { LoadingOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { API_BASE } from '../services/api';

export default function VnpayReturnPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        // Call backend to verify signature
        const res = await fetch(`${API_BASE}/api/vnpay/return?${searchParams.toString()}`);
        const data = await res.json();
        
        setResult(data);
      } catch (err) {
        console.error('Verify payment error:', err);
        setResult({ success: false, message: 'Lỗi kết nối khi xác thực thanh toán.' });
      } finally {
        setLoading(false);
      }
    };

    if (location.search) {
      verifyPayment();
    } else {
      setLoading(false);
      setResult({ success: false, message: 'Không tìm thấy thông tin thanh toán.' });
    }
  }, [location]);

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', padding: '60px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e8e8', borderRadius: '8px', padding: '40px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          {loading ? (
            <div style={{ padding: '40px 0' }}>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#000' }} spin />} />
              <h2 style={{ marginTop: '20px', fontSize: '18px', color: '#1b1b1b' }}>Đang xác thực thanh toán...</h2>
            </div>
          ) : (
            <>
              {result?.success ? (
                <CheckCircleFilled style={{ fontSize: '64px', color: '#52c41a', marginBottom: '24px' }} />
              ) : (
                <CloseCircleFilled style={{ fontSize: '64px', color: '#ff4d4f', marginBottom: '24px' }} />
              )}
              
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1b1b1b', marginBottom: '16px' }}>
                {result?.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
              </h1>
              
              <p style={{ fontSize: '15px', color: '#595959', marginBottom: '32px' }}>
                {result?.message}
                {result?.orderId && (
                  <span style={{ display: 'block', marginTop: '8px', fontWeight: 600 }}>
                    Mã đơn hàng: #{result.orderId}
                  </span>
                )}
              </p>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <Link to="/">
                  <button style={{
                    padding: '12px 24px',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    border: '1px solid #000000',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    VỀ TRANG CHỦ
                  </button>
                </Link>
                {result?.success && (
                  <Link to="/profile">
                    <button style={{
                      padding: '12px 24px',
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      XEM ĐƠN HÀNG
                    </button>
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
