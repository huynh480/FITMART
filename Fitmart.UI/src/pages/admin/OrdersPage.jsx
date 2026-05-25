import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Table, Input, Select, Modal, Descriptions, Divider, Spin, Alert, message } from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import { ordersApi } from '../../services/api';

const { Option } = Select;

const statusConfig = {
  pending:   { label: 'Chờ xác nhận', color: '#faad14', bg: '#fffbe6', border: '#ffe58f' },
  shipping:  { label: 'Đang giao',    color: '#1890ff', bg: '#e6f7ff', border: '#91d5ff' },
  completed: { label: 'Hoàn thành',   color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f' },
  cancelled: { label: 'Đã hủy',       color: '#ff4d4f', bg: '#fff2f0', border: '#ffccc7' },
};

const statusOptions = [
  { value: 'pending',   label: 'Chờ xác nhận' },
  { value: 'shipping',  label: 'Đang giao' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const formatVND = (v) => v.toLocaleString('vi-VN') + ' ₫';

/**
 * OrdersPage — /admin/orders
 */
export default function OrdersPage() {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  /* ── Fetch orders from Backend ── */
  const fetchOrders = useCallback(async () => {
    setLoading(true); 
    setError(null);
    try {
      const data = await ordersApi.getAll();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error('Lỗi khi tải danh sách đơn hàng:', e);
      setError('Lỗi kết nối máy chủ. Không thể lấy danh sách đơn hàng.');
      message.error(`Không thể lấy danh sách đơn hàng: ${e.message}`);
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  /* ── Filtered data ── */
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q);
      const matchStatus = !filterStatus || o.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, search, filterStatus]);

  /* ── Change status ── */
  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus); // stub → real PUT khi có API
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (detailModal?.id === orderId) {
        setDetailModal((prev) => ({ ...prev, status: newStatus }));
      }
      message.success('Cập nhật trạng thái thành công!');
    } catch (e) {
      message.error(`Lỗi cập nhật trạng thái: ${e.message}`);
    }
  };

  /* ── Table columns ── */
  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{id}</span>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      render: (name) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: 'Sản phẩm',
      key: 'products',
      render: (_, record) => (
        <span style={{ color: '#6e6e6e', fontSize: 13 }}>
          {record.items.length} sản phẩm
        </span>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (v) => <span style={{ fontWeight: 600 }}>{formatVND(v)}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (s) => {
        const cfg = statusConfig[s];
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            color: cfg.color,
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
          }}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <button
          className="admin-products__action-btn"
          onClick={() => setDetailModal(record)}
        >
          👁️ Xem
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="admin-content__header">
        <h1 className="admin-content__title">Quản lý đơn hàng</h1>
        <p className="admin-content__subtitle">{orders.length} đơn hàng trong hệ thống</p>
      </div>

      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} closable onClose={() => setError(null)} />}

      {/* Filters */}
      <div className="admin-products__filters">
        <Input
          placeholder="Tìm mã đơn hoặc tên khách..."
          prefix={<SearchOutlined style={{ color: '#bdbdbd' }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
        <Select
          placeholder="Trạng thái"
          value={filterStatus}
          onChange={setFilterStatus}
          allowClear
          style={{ width: 180 }}
        >
          {statusOptions.map((s) => (
            <Option key={s.value} value={s.value}>{s.label}</Option>
          ))}
        </Select>
      </div>

      <div className="admin-products__table-wrap">
        <Spin spinning={loading} indicator={<LoadingOutlined />}>
          <Table columns={columns} dataSource={filteredOrders} rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: false }} size="middle" />
        </Spin>
      </div>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết đơn hàng — ${detailModal?.id || ''}`}
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={null}
        width={680}
        destroyOnClose
      >
        {detailModal && (
          <>
            {/* Customer info */}
            <Descriptions
              column={1}
              size="small"
              style={{ marginBottom: 16 }}
              labelStyle={{ fontWeight: 600, color: '#1b1b1b', width: 140 }}
            >
              <Descriptions.Item label="Khách hàng">{detailModal.customer}</Descriptions.Item>
              <Descriptions.Item label="Email">{detailModal.email}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">{detailModal.address}</Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">{detailModal.date}</Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '12px 0' }} />

            {/* Items */}
            <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>
              Sản phẩm ({detailModal.items.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {detailModal.items.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  background: '#fafafa',
                  borderRadius: 8,
                  border: '1px solid #f0f0f0',
                }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: '#6e6e6e' }}>
                      Size: {item.size} · Màu: {item.color} · SL: {item.qty}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                    {formatVND(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* Totals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6e6e6e' }}>Tạm tính</span>
                <span>{formatVND(detailModal.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6e6e6e' }}>Phí vận chuyển</span>
                <span>{detailModal.shipping === 0 ? 'Miễn phí' : formatVND(detailModal.shipping)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, paddingTop: 6, borderTop: '1px solid #f0f0f0' }}>
                <span>Tổng cộng</span>
                <span>{formatVND(detailModal.total)}</span>
              </div>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* Status change */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>Trạng thái:</span>
              <Select
                value={detailModal.status}
                onChange={(val) => handleChangeStatus(detailModal.id, val)}
                style={{ width: 180 }}
              >
                {statusOptions.map((s) => (
                  <Option key={s.value} value={s.value}>{s.label}</Option>
                ))}
              </Select>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
