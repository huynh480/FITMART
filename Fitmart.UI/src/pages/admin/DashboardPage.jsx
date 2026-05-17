import React from 'react';
import { Table, Tag } from 'antd';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

/* ─── Mock data ─── */
const revenueData = [
  { day: '10/05', revenue: 4200000 },
  { day: '11/05', revenue: 6800000 },
  { day: '12/05', revenue: 5100000 },
  { day: '13/05', revenue: 8900000 },
  { day: '14/05', revenue: 7200000 },
  { day: '15/05', revenue: 9400000 },
  { day: '16/05', revenue: 11200000 },
];

const topProducts = [
  { name: 'Legacy Hoodie',     sold: 124 },
  { name: 'Power Jogger',      sold: 98 },
  { name: 'Studio T-Shirt',    sold: 87 },
  { name: 'Vital Legging Nữ',  sold: 76 },
  { name: 'GS Tank Top',       sold: 65 },
];

const recentOrders = [
  { id: 'ĐH-20240516001', customer: 'Nguyễn Minh Tuấn',  total: 1290000, status: 'pending',    date: '16/05/2026' },
  { id: 'ĐH-20240516002', customer: 'Trần Thị Mai',      total: 2450000, status: 'processing', date: '16/05/2026' },
  { id: 'ĐH-20240515003', customer: 'Lê Hoàng Nam',      total: 890000,  status: 'completed',  date: '15/05/2026' },
  { id: 'ĐH-20240515004', customer: 'Phạm Quỳnh Anh',   total: 3120000, status: 'completed',  date: '15/05/2026' },
  { id: 'ĐH-20240514005', customer: 'Vũ Đức Trung',     total: 1750000, status: 'cancelled',  date: '14/05/2026' },
];

const statusMap = {
  pending:    { label: 'Chờ xử lý',     cls: 'admin-order-status--pending' },
  processing: { label: 'Đang xử lý',    cls: 'admin-order-status--processing' },
  completed:  { label: 'Hoàn thành',     cls: 'admin-order-status--completed' },
  cancelled:  { label: 'Đã huỷ',        cls: 'admin-order-status--cancelled' },
};

const orderColumns = [
  { title: 'Mã đơn',     dataIndex: 'id',       key: 'id' },
  { title: 'Khách hàng',  dataIndex: 'customer', key: 'customer' },
  {
    title: 'Tổng tiền',
    dataIndex: 'total',
    key: 'total',
    render: (v) => v.toLocaleString('vi-VN') + ' ₫',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (s) => {
      const info = statusMap[s] || { label: s, cls: '' };
      return <span className={`admin-order-status ${info.cls}`}>{info.label}</span>;
    },
  },
  { title: 'Ngày',  dataIndex: 'date', key: 'date' },
];

/* ─── Stat card data ─── */
const stats = [
  {
    icon: '💰',
    iconCls: 'admin-stat-card__icon--revenue',
    label: 'Tổng doanh thu',
    value: '52.8M ₫',
    change: '+12.5%',
    up: true,
  },
  {
    icon: '📦',
    iconCls: 'admin-stat-card__icon--orders',
    label: 'Tổng đơn hàng',
    value: '1,284',
    change: '+8.2%',
    up: true,
  },
  {
    icon: '🏷️',
    iconCls: 'admin-stat-card__icon--products',
    label: 'Sản phẩm đang bán',
    value: '156',
    change: '+3',
    up: true,
  },
  {
    icon: '👥',
    iconCls: 'admin-stat-card__icon--users',
    label: 'Người dùng mới',
    value: '324',
    change: '-2.1%',
    up: false,
  },
];

/* ─── Tooltip formatter ─── */
const formatVND = (value) => value.toLocaleString('vi-VN') + ' ₫';

/**
 * DashboardPage — /admin
 */
export default function DashboardPage() {
  return (
    <>
      {/* Header */}
      <div className="admin-content__header">
        <h1 className="admin-content__title">Tổng quan</h1>
        <p className="admin-content__subtitle">
          Chào mừng trở lại! Đây là tình hình cửa hàng hôm nay.
        </p>
      </div>

      {/* Stat cards */}
      <div className="admin-stats">
        {stats.map((s, i) => (
          <div className="admin-stat-card" key={i}>
            <div className={`admin-stat-card__icon ${s.iconCls}`}>
              {s.icon}
            </div>
            <div className="admin-stat-card__info">
              <div className="admin-stat-card__label">{s.label}</div>
              <div className="admin-stat-card__value">{s.value}</div>
              <span
                className={`admin-stat-card__change ${
                  s.up ? 'admin-stat-card__change--up' : 'admin-stat-card__change--down'
                }`}
              >
                {s.up ? '↑' : '↓'} {s.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="admin-charts">
        {/* Revenue LineChart */}
        <div className="admin-chart-card">
          <h3 className="admin-chart-card__title">Doanh thu 7 ngày gần nhất</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6e6e6e' }} />
              <YAxis
                tick={{ fontSize: 12, fill: '#6e6e6e' }}
                tickFormatter={(v) => (v / 1000000).toFixed(1) + 'M'}
              />
              <Tooltip formatter={formatVND} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Doanh thu"
                stroke="#1b1b1b"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#1b1b1b' }}
                activeDot={{ r: 6, fill: '#1b1b1b' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top products BarChart */}
        <div className="admin-chart-card">
          <h3 className="admin-chart-card__title">Top 5 sản phẩm bán chạy</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#6e6e6e' }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 12, fill: '#1b1b1b' }}
                width={130}
              />
              <Tooltip />
              <Bar
                dataKey="sold"
                name="Đã bán"
                fill="#1b1b1b"
                radius={[0, 6, 6, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders */}
      <div className="admin-recent-orders">
        <h3 className="admin-recent-orders__title">Đơn hàng mới nhất</h3>
        <Table
          columns={orderColumns}
          dataSource={recentOrders}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </div>
    </>
  );
}
