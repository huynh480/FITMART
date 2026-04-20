import React from 'react';
import { Layout, Input, Space, Badge } from 'antd';
import { Link } from 'react-router-dom';
import { ShoppingCartOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Search } = Input;

const Navbar = () => {
  return (
    <Header style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 100, 
      width: '100%', 
      background: '#000000', 
      padding: 0,
      height: 'auto',
      lineHeight: 'normal',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
    }}>
      {/* Khối Logo, Tìm Kiếm và Icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 48px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {/* Logo */}
        <div className="logo" style={{ flex: 1 }}>
          <Link to="/" style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', textDecoration: 'none', letterSpacing: '1px' }}>
            FITMART
          </Link>
        </div>

        {/* Khung tìm kiếm ở giữa */}
        <div style={{ flex: 2, display: 'flex', justifyContent: 'center' }}>
          <Search 
            placeholder="Bạn tìm đồ tập gì?" 
            allowClear
            size="large"
            enterButton={<SearchOutlined />}
            style={{ width: '100%', maxWidth: '600px' }}
          />
        </div>

        {/* Các nút bấm bên phải */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Space size="large">
            <Link to="/profile">
              <UserOutlined className="nav-icon" />
            </Link>
            <Link to="/cart">
              <Badge count={2} color="#ffffff" style={{ color: '#000000' }} offset={[-2, 6]}>
                <ShoppingCartOutlined className="nav-icon" />
              </Badge>
            </Link>
          </Space>
        </div>
      </div>

      {/* Menu phụ phía dưới */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', padding: '12px 0', backgroundColor: '#000000' }}>
        <Link to="/category/men" className="nav-link">ĐỒ TẬP NAM</Link>
        <Link to="/category/women" className="nav-link">ĐỒ TẬP NỮ</Link>
        <Link to="/category/accessories" className="nav-link">PHỤ KIỆN</Link>
        <Link to="/category/equipment" className="nav-link">DỤNG CỤ</Link>
      </div>
    </Header>
  );
};

export default Navbar;