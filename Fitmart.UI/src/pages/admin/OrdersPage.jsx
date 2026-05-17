import React, { useState, useMemo } from 'react';
import { Table, Input, Select, Modal, Descriptions, Divider, Tag, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

/* ─── Mock data ─── */
const initialOrders = [
  {
    id: 'ĐH-20260516001',
    customer: 'Nguyễn Minh Tuấn',
    email: 'tuan.nm@gmail.com',
    address: '123 Nguyễn Huệ, Q.1, TP.HCM',
    items: [
      { name: 'Legacy Hoodie', image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg', size: 'L', color: 'Đen', qty: 1, price: 690000 },
      { name: 'Power Jogger', image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg', size: 'M', color: 'Xanh navy', qty: 1, price: 750000 },
    ],
    subtotal: 1440000,
    shipping: 30000,
    total: 1470000,
    status: 'pending',
    date: '16/05/2026',
  },
  {
    id: 'ĐH-20260516002',
    customer: 'Trần Thị Mai',
    email: 'mai.tt@gmail.com',
    address: '456 Lê Lợi, Q.3, TP.HCM',
    items: [
      { name: 'Sports Bra Everyday', image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg', size: 'S', color: 'Hồng', qty: 2, price: 520000 },
      { name: 'Vital Legging Nữ', image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg', size: 'S', color: 'Đen', qty: 1, price: 680000 },
    ],
    subtotal: 1720000,
    shipping: 0,
    total: 1720000,
    status: 'shipping',
    date: '16/05/2026',
  },
  {
    id: 'ĐH-20260515003',
    customer: 'Lê Hoàng Nam',
    email: 'nam.lh@gmail.com',
    address: '789 Trần Hưng Đạo, Q.5, TP.HCM',
    items: [
      { name: 'Studio T-Shirt', image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg', size: 'XL', color: 'Trắng', qty: 3, price: 350000 },
    ],
    subtotal: 1050000,
    shipping: 30000,
    total: 1080000,
    status: 'completed',
    date: '15/05/2026',
  },
  {
    id: 'ĐH-20260515004',
    customer: 'Phạm Quỳnh Anh',
    email: 'anh.pq@gmail.com',
    address: '12 Hai Bà Trưng, Q.1, TP.HCM',
    items: [
      { name: 'Gym Duffel Bag', image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg', size: '-', color: 'Đen', qty: 1, price: 799000 },
      { name: 'GS Tank Top', image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg', size: 'M', color: 'Trắng', qty: 2, price: 280000 },
    ],
    subtotal: 1359000,
    shipping: 0,
    total: 1359000,
    status: 'completed',
    date: '15/05/2026',
  },
  {
    id: 'ĐH-20260514005',
    customer: 'Vũ Đức Trung',
    email: 'trung.vd@gmail.com',
    address: '88 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',
    items: [
      { name: 'Legacy Hoodie', image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg', size: 'XL', color: 'Xám', qty: 1, price: 690000 },
    ],
    subtotal: 690000,
    shipping: 30000,
    total: 720000,
    status: 'cancelled',
    date: '14/05/2026',
  },
  {
    id: 'ĐH-20260514006',
    customer: 'Đặng Thu Hà',
    email: 'ha.dt@gmail.com',
    address: '55 Võ Văn Tần, Q.3, TP.HCM',
    items: [
      { name: 'Crop Top Vital', image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg', size: 'M', color: 'Trắng', qty: 1, price: 420000 },
      { name: 'Vital Legging Nữ', image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg', size: 'M', color: 'Hồng', qty: 1, price: 680000 },
    ],
    subtotal: 1100000,
    shipping: 30000,
    total: 1130000,
    status: 'pending',
    date: '14/05/2026',
  },
  {
    id: 'ĐH-20260513007',
    customer: 'Bùi Thanh Sơn',
    email: 'son.bt@gmail.com',
    address: '200 Cách Mạng Tháng 8, Q.10, TP.HCM',
    items: [
      { name: 'Power Jogger', image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg', size: 'L', color: 'Đen', qty: 2, price: 750000 },
    ],
    subtotal: 1500000,
    shipping: 0,
    total: 1500000,
    status: 'shipping',
    date: '13/05/2026',
  },
];

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
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

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
  const handleChangeStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    // Also update modal if open
    if (detailModal?.id === orderId) {
      setDetailModal((prev) => ({ ...prev, status: newStatus }));
    }
    message.success('Cập nhật trạng thái thành công!');
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
      {/* Header */}
      <div className="admin-content__header">
        <h1 className="admin-content__title">Quản lý đơn hàng</h1>
        <p className="admin-content__subtitle">
          {orders.length} đơn hàng trong hệ thống
        </p>
      </div>

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

      {/* Table */}
      <div className="admin-products__table-wrap">
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          size="middle"
        />
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
