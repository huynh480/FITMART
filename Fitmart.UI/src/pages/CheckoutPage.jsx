import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { formatPrice } from '../config/productData';
import { ordersApi, API_BASE } from '../services/api';
import { message, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const PLACEHOLDER_IMG = 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%22 height%3D%22100%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%22 height%3D%22100%22 fill%3D%22%23f5f5f5%22%2F%3E%3Ctext x%3D%2250%25%22 y%3D%2250%25%22 dominant-baseline%3D%22middle%22 text-anchor%3D%22middle%22 font-family%3D%22sans-serif%22 font-size%3D%2210%22 fill%3D%22%23aaa%22%3ENo Image%3C%2Ftext%3E%3C%2Fsvg%3E';

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'bank'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync user name if it loads later
  useEffect(() => {
    if (user?.name && !fullName) {
      setFullName(user.name);
    }
  }, [user, fullName]);

  // If cart is empty, redirect back to home or collection
  useEffect(() => {
    if (cartItems.length === 0 && !isSubmitting) {
      // Allow a brief moment, then redirect if still empty
      const timer = setTimeout(() => {
        if (cartItems.length === 0) {
          message.info('Giỏ hàng của bạn đang trống.');
          navigate('/');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cartItems, navigate, isSubmitting]);

  // Image resolver
  const resolveImageUrl = (path) => {
    if (!path) return PLACEHOLDER_IMG;
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
    return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // Calculation
  const shippingFee = totalPrice >= 500000 ? 0 : 30000;
  const finalTotal = totalPrice + shippingFee;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      message.error('Vui lòng nhập họ và tên nhận hàng');
      return;
    }
    if (!phone.trim()) {
      message.error('Vui lòng nhập số điện thoại');
      return;
    }
    // Simple phone check
    if (!/^\d{9,11}$/.test(phone.trim().replace(/[\s.-]/g, ''))) {
      message.error('Số điện thoại không hợp lệ (yêu cầu 9-11 chữ số)');
      return;
    }
    if (!address.trim()) {
      message.error('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build order payload matching OrderCreateDto
      const payload = {
        userId: user?.id || 1, // Fallback to 1 if guest
        customerName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        paymentMethod: paymentMethod,
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size || 'M',
          color: item.colorName || 'Mặc định'
        }))
      };

      const result = await ordersApi.create(payload);

      // Successfully created order
      message.success('Đặt hàng thành công!');
      
      // Clear Cart state
      clearCart();

      // Redirect to Thank You page
      navigate('/thank-you', {
        state: {
          orderId: result?.orderId || 'FTM' + Math.floor(Math.random() * 90000 + 10000),
          totalAmount: result?.totalAmount || finalTotal,
          customerName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          paymentMethod: paymentMethod
        }
      });
    } catch (err) {
      console.error('Lỗi khi đặt hàng:', err);
      message.error(err.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', padding: '60px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Breadcrumb / Title */}
        <div style={{ marginBottom: '32px', textAlign: 'left' }}>
          <span style={{ fontSize: '13px', color: '#8c8c8c', letterSpacing: '0.5px' }}>
            <Link to="/" style={{ color: '#8c8c8c', textDecoration: 'none' }}>TRANG CHỦ</Link>
            {' '}/{' '}
            <span style={{ color: '#1b1b1b', fontWeight: 500 }}>THANH TOÁN</span>
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1b1b1b', marginTop: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Thanh toán đơn hàng
          </h1>
        </div>

        {/* 2-Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '40px' }} className="checkout-grid">
          
          {/* LEFT: Shipping Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Card: Shipping info */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1b1b1b', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
                Thông tin giao hàng
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Full name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14px', color: '#1b1b1b', fontWeight: 500, textAlign: 'left' }}>Họ và tên *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ tên người nhận"
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      color: '#1b1b1b',
                      transition: 'border-color 0.2s',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#1b1b1b')}
                    onBlur={(e) => (e.target.style.borderColor = '#d9d9d9')}
                  />
                </div>

                {/* Phone & Email Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', color: '#1b1b1b', fontWeight: 500, textAlign: 'left' }}>Số điện thoại *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      style={{
                        padding: '12px 16px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '4px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                        color: '#1b1b1b',
                        transition: 'border-color 0.2s',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#1b1b1b')}
                      onBlur={(e) => (e.target.style.borderColor = '#d9d9d9')}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', color: '#8c8c8c', fontWeight: 500, textAlign: 'left' }}>Email (Không bắt buộc)</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      disabled={!!user}
                      placeholder="Nhập email để nhận cập nhật đơn hàng"
                      style={{
                        padding: '12px 16px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '4px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: user ? '#f5f5f5' : '#ffffff',
                        color: '#1b1b1b',
                        cursor: user ? 'not-allowed' : 'text',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Address */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14px', color: '#1b1b1b', fontWeight: 500, textAlign: 'left' }}>Địa chỉ giao hàng *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      color: '#1b1b1b',
                      transition: 'border-color 0.2s',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#1b1b1b')}
                    onBlur={(e) => (e.target.style.borderColor = '#d9d9d9')}
                  />
                </div>
              </div>
            </div>

            {/* Card: Payment method */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1b1b1b', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
                Phương thức thanh toán
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Option 1: COD */}
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  border: paymentMethod === 'cod' ? '2px solid #000000' : '1px solid #e8e8e8',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'cod' ? '#fafafa' : '#ffffff',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    style={{ marginTop: '4px', accentColor: '#000000' }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: '#1b1b1b' }}>Thanh toán khi nhận hàng (COD)</div>
                    <div style={{ fontSize: '13px', color: '#8c8c8c', marginTop: '4px' }}>
                      Quý khách thanh toán bằng tiền mặt cho shipper khi nhận được hàng.
                    </div>
                  </div>
                </label>

                {/* Option 2: Bank Transfer */}
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  border: paymentMethod === 'bank' ? '2px solid #000000' : '1px solid #e8e8e8',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'bank' ? '#fafafa' : '#ffffff',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={() => setPaymentMethod('bank')}
                    style={{ marginTop: '4px', accentColor: '#000000' }}
                  />
                  <div style={{ textAlign: 'left', width: '100%' }}>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: '#1b1b1b' }}>Chuyển khoản ngân hàng (Bank Transfer)</div>
                    <div style={{ fontSize: '13px', color: '#8c8c8c', marginTop: '4px' }}>
                      Chuyển khoản qua số tài khoản chính thức của FITMART. Đơn hàng sẽ được xác nhận sau khi nhận tiền.
                    </div>
                  </div>
                </label>

                {/* Bank Details Dropdown (when selected) */}
                {paymentMethod === 'bank' && (
                  <div style={{
                    marginTop: '8px',
                    padding: '20px',
                    backgroundColor: '#f9f9f9',
                    border: '1px dashed #d9d9d9',
                    borderRadius: '4px',
                    textAlign: 'left',
                    animation: 'fadeIn 0.3s ease-in-out'
                  }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1b1b1b', marginBottom: '12px', textTransform: 'uppercase' }}>Thông tin tài khoản:</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#434343' }}>
                      <div>Ngân hàng: <strong>Techcombank (Ngân hàng Kỹ thương Việt Nam)</strong></div>
                      <div>Số tài khoản: <strong>1903 8888 9999</strong></div>
                      <div>Chủ tài khoản: <strong>CONG TY TNHH FITMART VIET NAM</strong></div>
                      <div>Chi nhánh: <strong>Hội sở chính - Hà Nội</strong></div>
                      <div style={{ marginTop: '8px', padding: '10px', backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '4px', color: '#d46b08', fontSize: '12px' }}>
                        Nội dung chuyển khoản ghi rõ: <strong>FITMART [Số điện thoại của bạn]</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* RIGHT: Order Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '32px', position: 'sticky', top: '100px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1b1b1b', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
                Đơn hàng của bạn ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
              </h2>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '320px', overflowY: 'auto', marginBottom: '24px', paddingRight: '4px' }}>
                {cartItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #f5f5f5', paddingBottom: '16px' }}>
                    <div style={{ width: '64px', height: '64px', backgroundColor: '#f5f5f5', overflow: 'hidden', borderRadius: '2px', flexShrink: 0 }}>
                      <img
                        src={resolveImageUrl(item.image)}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1b1b1b', margin: '0 0 4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </h3>
                      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        Màu: {item.colorName} | Size: {item.size}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '13px', color: '#1b1b1b' }}>x{item.quantity}</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1b1b1b' }}>
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial calculations */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8c8c8c' }}>Tạm tính</span>
                  <span style={{ fontWeight: 500, color: '#1b1b1b' }}>{formatPrice(totalPrice)}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8c8c8c' }}>Phí vận chuyển</span>
                  <span style={{ fontWeight: 500, color: '#1b1b1b' }}>
                    {shippingFee === 0 ? <span style={{ color: '#52c41a', fontWeight: 600 }}>Miễn phí</span> : formatPrice(shippingFee)}
                  </span>
                </div>
                
                {shippingFee > 0 && (
                  <div style={{ fontSize: '12px', color: '#8c8c8c', textAlign: 'left', backgroundColor: '#f0f5ff', padding: '8px 12px', borderRadius: '4px', border: '1px solid #adc6ff' }}>
                    💡 Miễn phí vận chuyển cho đơn hàng từ <strong>500.000₫</strong> (Mua thêm {formatPrice(500000 - totalPrice)} để được freeship).
                  </div>
                )}

                <div style={{ height: '1px', backgroundColor: '#f0f0f0', margin: '8px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, color: '#1b1b1b', textTransform: 'uppercase' }}>Tổng thanh toán</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#000000' }}>
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || cartItems.length === 0}
                style={{
                  width: '100%',
                  height: '52px',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  cursor: isSubmitting || cartItems.length === 0 ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && cartItems.length > 0) e.currentTarget.style.backgroundColor = '#1b1b1b';
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting && cartItems.length > 0) e.currentTarget.style.backgroundColor = '#000000';
                }}
              >
                {isSubmitting ? (
                  <>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 18, color: '#fff' }} spin />} />
                    ĐANG XỬ LÝ...
                  </>
                ) : (
                  'ĐẶT HÀNG NGAY'
                )}
              </button>

              <div style={{ marginTop: '16px', fontSize: '12px', color: '#8c8c8c' }}>
                🔒 Giao dịch của bạn luôn được bảo mật và an toàn tuyệt đối.
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Embedded Animations and media query overrides */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 992px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .checkout-grid > div:last-child {
            order: -1;
          }
        }
        @media (max-width: 576px) {
          .form-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
