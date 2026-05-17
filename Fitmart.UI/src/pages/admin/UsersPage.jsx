import React, { useState, useMemo } from 'react';
import { Table, Input, Select, Modal, Switch, message, Avatar } from 'antd';
import { SearchOutlined, UserOutlined, ExclamationCircleFilled } from '@ant-design/icons';

const { Option } = Select;
const { confirm } = Modal;

/* ─── Mock data ─── */
const initialUsers = [
  {
    id: 1,
    name: 'Admin FITMART',
    email: 'admin@fitmart.vn',
    role: 'admin',
    avatar: null,
    createdAt: '01/01/2026',
    active: true,
  },
  {
    id: 2,
    name: 'Nguyễn Minh Tuấn',
    email: 'tuan.nm@gmail.com',
    role: 'user',
    avatar: null,
    createdAt: '10/03/2026',
    active: true,
  },
  {
    id: 3,
    name: 'Trần Thị Mai',
    email: 'mai.tt@gmail.com',
    role: 'user',
    avatar: null,
    createdAt: '15/03/2026',
    active: true,
  },
  {
    id: 4,
    name: 'Lê Hoàng Nam',
    email: 'nam.lh@gmail.com',
    role: 'user',
    avatar: null,
    createdAt: '22/03/2026',
    active: false,
  },
  {
    id: 5,
    name: 'Phạm Quỳnh Anh',
    email: 'anh.pq@gmail.com',
    role: 'user',
    avatar: null,
    createdAt: '01/04/2026',
    active: true,
  },
  {
    id: 6,
    name: 'Vũ Đức Trung',
    email: 'trung.vd@gmail.com',
    role: 'user',
    avatar: null,
    createdAt: '08/04/2026',
    active: true,
  },
  {
    id: 7,
    name: 'Đặng Thu Hà',
    email: 'ha.dt@gmail.com',
    role: 'user',
    avatar: null,
    createdAt: '12/04/2026',
    active: true,
  },
  {
    id: 8,
    name: 'Bùi Thanh Sơn',
    email: 'son.bt@gmail.com',
    role: 'admin',
    avatar: null,
    createdAt: '18/04/2026',
    active: true,
  },
  {
    id: 9,
    name: 'Hoàng Thị Lan',
    email: 'lan.ht@gmail.com',
    role: 'user',
    avatar: null,
    createdAt: '25/04/2026',
    active: false,
  },
  {
    id: 10,
    name: 'Ngô Văn Hùng',
    email: 'hung.nv@gmail.com',
    role: 'user',
    avatar: null,
    createdAt: '05/05/2026',
    active: true,
  },
];

/**
 * UsersPage — /admin/users
 */
export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState(null);

  /* ── Filtered data ── */
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchRole = !filterRole || u.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [users, search, filterRole]);

  /* ── Change role ── */
  const handleChangeRole = (userId, newRole) => {
    // PUT /api/users/:id/role
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    message.success('Đã cập nhật role!');
  };

  /* ── Toggle active status ── */
  const handleToggleActive = (user) => {
    if (user.active) {
      // Confirm before locking
      confirm({
        title: 'Xác nhận khoá tài khoản',
        icon: <ExclamationCircleFilled />,
        content: `Bạn chắc chắn muốn khoá tài khoản "${user.name}"? Người dùng sẽ không thể đăng nhập.`,
        okText: 'Khoá',
        cancelText: 'Huỷ',
        okButtonProps: { danger: true },
        onOk() {
          setUsers((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, active: false } : u))
          );
          message.success(`Đã khoá tài khoản ${user.name}`);
        },
      });
    } else {
      // Unlock directly
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, active: true } : u))
      );
      message.success(`Đã mở khoá tài khoản ${user.name}`);
    }
  };

  /* ── Table columns ── */
  const columns = [
    {
      title: 'Avatar',
      key: 'avatar',
      width: 64,
      render: (_, record) => (
        <Avatar
          size={40}
          icon={<UserOutlined />}
          src={record.avatar}
          style={{
            background: record.role === 'admin' ? '#1b1b1b' : '#d9d9d9',
            color: record.role === 'admin' ? '#fff' : '#6e6e6e',
          }}
        />
      ),
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span style={{ fontWeight: 600 }}>{name}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => <span style={{ color: '#6e6e6e' }}>{email}</span>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (role, record) => (
        <Select
          value={role}
          onChange={(val) => handleChangeRole(record.id, val)}
          size="small"
          style={{ width: 110 }}
        >
          <Option value="admin">
            <span style={{ fontWeight: 600 }}>Admin</span>
          </Option>
          <Option value="user">User</Option>
        </Select>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Trạng thái',
      key: 'active',
      width: 140,
      render: (_, record) => (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '3px 14px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          color: record.active ? '#52c41a' : '#ff4d4f',
          background: record.active ? '#f6ffed' : '#fff2f0',
          border: `1px solid ${record.active ? '#b7eb8f' : '#ffccc7'}`,
        }}>
          {record.active ? 'Hoạt động' : 'Đã khoá'}
        </span>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Switch
            checked={record.active}
            onChange={() => handleToggleActive(record)}
            size="small"
          />
          <span style={{ fontSize: 12, color: '#6e6e6e' }}>
            {record.active ? 'Khoá' : 'Mở'}
          </span>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="admin-content__header">
        <h1 className="admin-content__title">Quản lý người dùng</h1>
        <p className="admin-content__subtitle">
          {users.length} người dùng trong hệ thống
        </p>
      </div>

      {/* Filters */}
      <div className="admin-products__filters">
        <Input
          placeholder="Tìm theo tên hoặc email..."
          prefix={<SearchOutlined style={{ color: '#bdbdbd' }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
        <Select
          placeholder="Role"
          value={filterRole}
          onChange={setFilterRole}
          allowClear
          style={{ width: 140 }}
        >
          <Option value="admin">Admin</Option>
          <Option value="user">User</Option>
        </Select>
      </div>

      {/* Table */}
      <div className="admin-products__table-wrap">
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          size="middle"
        />
      </div>
    </>
  );
}
