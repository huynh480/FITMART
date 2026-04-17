import React from 'react';
import { Layout, Menu, Badge } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCartOutlined, HomeOutlined, DashboardOutlined } from '@ant-design/icons';

const { Header } = Layout;

const Navbar = () => {
  const location = useLocation();

  const items = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Trang chủ</Link>,
    },
    {
      key: '/cart',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/cart">Giỏ hàng</Link>,
    },
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Admin</Link>,
    }
  ];

  return (
    <Header style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 1, 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      background: '#fff', 
      borderBottom: '1px solid #f0f0f0',
      padding: '0 48px'
    }}>
      <div className="logo" style={{ marginRight: '40px' }}>
        <Link to="/" style={{ fontSize: '24px', fontWeight: '900', color: '#1890ff', textDecoration: 'none' }}>
          FITMART
        </Link>
      </div>
      <Menu
        theme="light"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={items}
        style={{ flex: 1, borderBottom: 'none' }}
      />
    </Header>
  );
};

export default Navbar;