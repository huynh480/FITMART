import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ordersApi, API_BASE } from '../services/api';
import { message, Spin, Popconfirm, Empty } from 'antd';
import { LoadingOutlined, HistoryOutlined } from '@ant-design/icons';

const PLACEHOLDER_IMG = 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%22 height%3D%22100%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%22 height%3D%22100%22 fill%3D%22%23f5f5f5%22%2F%3E%3Ctext x%3D%2250%25%22 y%3D%2250%25%22 dominant-baseline%3D%22middle%22 text-anchor%3D%22middle%22 font-family%3D%22sans-serif%22 font-size%3D%2210%22 fill%3D%22%23aaa%22%3ENo Image%3C%2Ftext%3E%3C%2Fsvg%3E';

const statusConfig = {
  pending:   { label: 'Chờ xác nhận', color: '#faad14', bg: '#fffbe6', border: '#ffe58f' },
  shipping:  { label: 'Đang giao',    color: '#1890ff', bg: '#e6f7ff', border: '#91d5ff' },
  completed: { label: 'Hoàn thành',   color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f' },
  cancelled: { label: 'Đã hủy',       color: '#ff4d4f', bg: '#fff2f0', border: '#ffccc7' },
};

const formatVND = (v) => v.toLocaleString('vi-VN') + ' ₫';

export default function MyOrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  // Fallback to userId = 1 for guests/demo as defined in implementation plan
  const userId = user?.id || 1;

  const fetchUserOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ordersApi.getMyOrders(userId);
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', e);
      message.error('Không thể lấy lịch sử đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  const handleCancelOrder = async (orderId) => {
    setCancellingId(orderId);
    try {
      await ordersApi.updateStatus(orderId, 'cancelled');
      message.success('Hủy đơn hàng thành công!');
      // Update local state instead of doing full reload
      setOrders(prev => 
        prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o)
      );
    } catch (e) {
      message.error(`Hủy đơn hàng thất bại: ${e.message}`);
    } finally {
      setCancellingId(null);
    }
  };

  const resolveImageUrl = (path) => {
    if (!path) return PLACEHOLDER_IMG;
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
    return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return (
    <div style={{ backgroundColor: '#fcfcfc', minHeight: '100vh', padding: '60px 0' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Title */}
        <div style={{ marginBottom: '40px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <HistoryOutlined style={{ fontSize: '26px', color: '#1b1b1b' }} />
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1b1b1b', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Đơn hàng của tôi
            </h1>
            <p style={{ fontSize: '13px', color: '#6e6e6e', margin: '4px 0 0' }}>
              Xem và theo dõi lịch sử mua hàng của bạn tại FITMART
            </p>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 36, color: '#1b1b1b' }} spin />} />
            <span style={{ fontSize: '14px', color: '#8c8c8c' }}>Đang tải lịch sử đơn hàng...</span>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e8e8e8',
            borderRadius: '4px',
            padding: '60px 24px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <Empty
              description={
                <span style={{ fontSize: '15px', color: '#6e6e6e', fontWeight: 500 }}>
                  Bạn chưa có đơn hàng nào tại FITMART.
                </span>
              }
            />
            <Link to="/">
              <button style={{
                marginTop: '24px',
                padding: '12px 28px',
                backgroundColor: '#1b1b1b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#434343'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1b1b1b'}
              >
                MUA SẮM NGAY
              </button>
            </Link>
          </div>
        ) : (
          /* Orders list */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {orders.map((order) => {
              const cfg = statusConfig[order.status] || { label: order.status, color: '#6e6e6e', bg: '#f5f5f5', border: '#d9d9d9' };
              const isPending = order.status === 'pending';

              return (
                <div 
                  key={order.id} 
                  className="order-card"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e8e8e8',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    animation: 'fadeInUp 0.4s ease-out'
                  }}
                >
                  {/* Order Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: '#fafafa'
                  }} className="order-header-responsive">
                    <div style={{ display: 'flex', gap: '24px' }} className="order-meta-responsive">
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '11px', color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mã đơn hàng</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'monospace', color: '#1b1b1b', marginTop: '2px' }}>
                          #{order.id}
                        </div>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '11px', color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ngày đặt hàng</div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#434343', marginTop: '2px' }}>{order.date}</div>
                      </div>
                    </div>
                    <div>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: cfg.color,
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`
                      }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '20px', borderBottom: idx < order.items.length - 1 ? '1px solid #f5f5f5' : 'none', paddingBottom: idx < order.items.length - 1 ? '16px' : 0 }}>
                        <div style={{ width: '70px', height: '70px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#fafafa', border: '1px solid #f0f0f0', flexShrink: 0 }}>
                          <img
                            src={resolveImageUrl(item.image)}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }}
                          />
                        </div>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1b1b1b', margin: '0 0 6px' }}>{item.name}</h4>
                          <p style={{ fontSize: '12px', color: '#8c8c8c', margin: 0 }}>
                            Size: {item.size} · Màu: {item.color} · Số lượng: {item.qty}
                          </p>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#1b1b1b', margin: '8px 0 0' }}>
                            {formatVND(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    borderTop: '1px solid #f0f0f0',
                    backgroundColor: '#fafafa'
                  }} className="order-footer-responsive">
                    
                    {/* Action buttons (Cancel order) */}
                    <div>
                      {isPending && (
                        <Popconfirm
                          title="Hủy đơn hàng"
                          description="Bạn có chắc chắn muốn hủy đơn hàng này không?"
                          onConfirm={() => handleCancelOrder(order.id)}
                          okText="Hủy đơn"
                          cancelText="Không"
                          okButtonProps={{ danger: true, loading: cancellingId === order.id }}
                        >
                          <button style={{
                            padding: '8px 16px',
                            backgroundColor: '#fff',
                            color: '#ff4d4f',
                            border: '1px solid #ff4d4f',
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            letterSpacing: '0.5px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#ff4d4f';
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fff';
                            e.currentTarget.style.color = '#ff4d4f';
                          }}
                          >
                            HỦY ĐƠN HÀNG
                          </button>
                        </Popconfirm>
                      )}
                    </div>

                    {/* Total cost */}
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '13px', color: '#8c8c8c', marginRight: '8px' }}>Tổng thanh toán:</span>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: '#000000' }}>
                        {formatVND(order.total)}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Embedded custom CSS */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important;
        }
        @media (max-width: 576px) {
          .order-header-responsive {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .order-meta-responsive {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .order-footer-responsive {
            flex-direction: column-reverse !important;
            align-items: stretch !important;
            gap: 16px !important;
            text-align: left !important;
          }
          .order-footer-responsive button {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
