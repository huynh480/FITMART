import React, { useState, useEffect, useCallback } from 'react';
import { Table } from 'antd';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { dashboardApi, ordersApi } from '../../services/api';

/* ─── Status map cho đơn hàng ─── */
const statusMap = {
  pending:    { label: 'Chờ xử lý',  cls: 'admin-order-status--pending' },
  processing: { label: 'Đang xử lý', cls: 'admin-order-status--processing' },
  completed:  { label: 'Hoàn thành',  cls: 'admin-order-status--completed' },
  cancelled:  { label: 'Đã huỷ',     cls: 'admin-order-status--cancelled' },
  shipping:   { label: 'Đang giao',   cls: 'admin-order-status--processing' },
};

/* ─── Cấu hình cột cho bảng đơn hàng ─── */
const orderColumns = [
  { title: 'Mã đơn',      dataIndex: 'id',       key: 'id' },
  { title: 'Khách hàng',   dataIndex: 'customer', key: 'customer' },
  {
    title: 'Tổng tiền',
    dataIndex: 'total',
    key: 'total',
    render: (v) => Number(v).toLocaleString('vi-VN') + ' ₫',
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
  { title: 'Ngày', dataIndex: 'date', key: 'date' },
];

/* ─── Format tiền VNĐ cho Tooltip biểu đồ ─── */
const formatVND = (value) => Number(value).toLocaleString('vi-VN') + ' ₫';

/* ─── Format hiển thị số lớn ─── */
function formatLargeNumber(num) {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B ₫';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M ₫';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K ₫';
  return num.toLocaleString('vi-VN') + ' ₫';
}

/**
 * DashboardPage — /admin
 * Hiển thị thống kê thực từ database
 */
export default function DashboardPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await dashboardApi.getStats();
      setData(stats);
    } catch (e) {
      setError(e.message || 'Không thể tải dữ liệu dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-dashboard-spinner" />
        <p>Đang tải dữ liệu thống kê...</p>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="admin-dashboard-error">
        <span className="admin-dashboard-error__icon">⚠️</span>
        <p>{error}</p>
        <button className="admin-dashboard-error__retry" onClick={fetchDashboard}>
          Thử lại
        </button>
      </div>
    );
  }

  /* ── Build stat cards ── */
  const stats = [
    {
      icon: '💰',
      iconCls: 'admin-stat-card__icon--revenue',
      label: 'Tổng doanh thu',
      value: formatLargeNumber(data.totalRevenue || 0),
    },
    {
      icon: '📦',
      iconCls: 'admin-stat-card__icon--orders',
      label: 'Tổng đơn hàng',
      value: (data.totalOrders || 0).toLocaleString('vi-VN'),
    },
    {
      icon: '🏷️',
      iconCls: 'admin-stat-card__icon--products',
      label: 'Sản phẩm đang bán',
      value: (data.totalProducts || 0).toLocaleString('vi-VN'),
    },
    {
      icon: '👥',
      iconCls: 'admin-stat-card__icon--users',
      label: 'Tổng người dùng',
      value: (data.totalUsers || 0).toLocaleString('vi-VN'),
    },
  ];

  const revenueData  = data.revenueByDay  || [];
  const topProducts  = data.topProducts   || [];
  const recentOrders = data.recentOrders  || [];

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
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="admin-charts">
        {/* Revenue LineChart */}
        <div className="admin-chart-card">
          <h3 className="admin-chart-card__title">Doanh thu 7 ngày gần nhất</h3>
          {revenueData.length > 0 ? (
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
          ) : (
            <div className="admin-chart-card__empty">Chưa có dữ liệu doanh thu</div>
          )}
        </div>

        {/* Top products BarChart */}
        <div className="admin-chart-card">
          <h3 className="admin-chart-card__title">Top 5 sản phẩm bán chạy</h3>
          {topProducts.length > 0 ? (
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
          ) : (
            <div className="admin-chart-card__empty">Chưa có dữ liệu bán hàng</div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="admin-recent-orders">
        <h3 className="admin-recent-orders__title">Đơn hàng mới nhất</h3>
        {recentOrders.length > 0 ? (
          <Table
            columns={orderColumns}
            dataSource={recentOrders}
            rowKey="id"
            pagination={false}
            size="middle"
          />
        ) : (
          <div className="admin-chart-card__empty">Chưa có đơn hàng nào</div>
        )}
      </div>
    </>
  );
}
