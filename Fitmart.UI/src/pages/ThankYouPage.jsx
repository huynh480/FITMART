import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { formatPrice } from '../config/productData';
import { CheckCircleFilled } from '@ant-design/icons';

export default function ThankYouPage() {
  const location = useLocation();
  const orderDetails = location.state;

  // If page accessed directly without placing an order, redirect home
  if (!orderDetails) {
    return <Navigate to="/" replace />;
  }

  const {
    orderId,
    totalAmount,
    customerName,
    phone,
    address,
    paymentMethod
  } = orderDetails;

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '60px 0' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 24px', width: '100%' }}>
        
        {/* Success Card */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e8e8e8',
          borderRadius: '4px',
          padding: '40px 32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          textAlign: 'center'
        }}>
          {/* Success Icon */}
          <CheckCircleFilled style={{ fontSize: '72px', color: '#52c41a', marginBottom: '24px' }} />

          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1b1b1b', marginBottom: '12px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Đặt hàng thành công!
          </h1>
          
          <p style={{ fontSize: '15px', color: '#6e6e6e', lineHeight: '1.6', margin: '0 0 32px' }}>
            Cảm ơn <strong>{customerName}</strong> đã tin tưởng lựa chọn sản phẩm của <strong>FITMART</strong>. Đơn hàng của bạn đã được ghi nhận trên hệ thống và đang được xử lý.
          </p>

          {/* Details Box */}
          <div style={{
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            padding: '24px',
            textAlign: 'left',
            marginBottom: '32px',
            border: '1px solid #f0f0f0'
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1b1b1b', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Thông tin chi tiết đơn hàng
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#434343' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8c8c8c' }}>Mã đơn hàng:</span>
                <span style={{ fontWeight: 700, color: '#1b1b1b' }}>#{orderId}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8c8c8c' }}>Tổng thanh toán:</span>
                <span style={{ fontWeight: 700, color: '#ff4d4f', fontSize: '15px' }}>{formatPrice(totalAmount)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8c8c8c' }}>Phương thức:</span>
                <span style={{ fontWeight: 600, color: '#1b1b1b' }}>
                  {paymentMethod === 'cod' ? 'Thanh toán COD' : 'Chuyển khoản ngân hàng'}
                </span>
              </div>

              <div style={{ height: '1px', backgroundColor: '#f0f0f0', margin: '4px 0' }} />

              <div>
                <span style={{ color: '#8c8c8c', display: 'block', marginBottom: '4px' }}>Địa chỉ nhận hàng:</span>
                <strong style={{ color: '#1b1b1b', display: 'block', lineHeight: '1.4' }}>{customerName} — {phone}</strong>
                <span style={{ color: '#595959', display: 'block', marginTop: '2px', lineHeight: '1.4' }}>{address}</span>
              </div>
            </div>
          </div>

          {/* Conditional Bank Transfer Guide */}
          {paymentMethod === 'bank' && (
            <div style={{
              backgroundColor: '#fffbe6',
              border: '1px solid #ffe58f',
              borderRadius: '4px',
              padding: '20px',
              textAlign: 'left',
              marginBottom: '32px',
              fontSize: '13px',
              color: '#d46b08'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#d46b08', marginBottom: '8px', textTransform: 'uppercase' }}>
                👉 Hướng dẫn thanh toán chuyển khoản:
              </h3>
              <p style={{ margin: '0 0 10px', lineHeight: '1.5' }}>
                Vui lòng chuyển số tiền <strong>{formatPrice(totalAmount)}</strong> vào tài khoản ngân hàng dưới đây để hoàn tất đơn hàng:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px dashed #ffe58f', paddingTop: '10px' }}>
                <div>Ngân hàng: <strong>Techcombank</strong></div>
                <div>Số tài khoản: <strong>1903 8888 9999</strong></div>
                <div>Chủ tài khoản: <strong>CONG TY TNHH FITMART VIET NAM</strong></div>
                <div>Nội dung chuyển khoản: <strong>FITMART {phone}</strong></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/" style={{
              flex: 1,
              height: '48px',
              lineHeight: '48px',
              backgroundColor: '#000000',
              color: '#ffffff',
              borderRadius: '4px',
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'background-color 0.2s',
              display: 'inline-block'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1b1b1b')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#000000')}
            >
              Tiếp tục mua sắm
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
