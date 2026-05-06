import React, { useState } from 'react';
import { Layout, Badge, Input } from 'antd';
import { Link } from 'react-router-dom';
import { ShoppingCartOutlined, UserOutlined, SearchOutlined, HeartOutlined, CloseOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Search } = Input;

const Navbar = () => {
  const [isSearchActive, setIsSearchActive] = useState(false);

  return (
    <>
      {/* Top Promotional Banner (Đặc trưng của Gymshark) */}
      <div style={{ backgroundColor: '#f5f5f5', color: '#000000', textAlign: 'center', padding: '10px 16px', fontSize: '12px', fontWeight: 'bold', fontFamily: "'Roboto', sans-serif", letterSpacing: '1px' }}>
        MIỄN PHÍ VẬN CHUYỂN VỚI ĐƠN HÀNG TỪ 500.000Đ
      </div>

      <Header className="bg-white border-b border-gray-100" style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        width: '100%', 
        background: '#ffffff', 
        padding: '0 60px',
        height: '76px',
        lineHeight: '76px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Khung Category Links */}
        <div style={{ display: 'flex', gap: '15px', flex: 1 }}>
          <Link to="/category/men" className="nav-link" style={{ fontFamily: "'Roboto', sans-serif", fontSize: '15px' }}>NAM</Link>
          <Link to="/category/women" className="nav-link" style={{ fontFamily: "'Roboto', sans-serif", fontSize: '15px' }}>NỮ</Link>
          <Link to="/category/accessories" className="nav-link" style={{ fontFamily: "'Roboto', sans-serif", fontSize: '15px' }}>PHỤ KIỆN</Link>
        </div>

        {/* Logo */}
        <div className="logo" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Link to="/" style={{ fontSize: '26px', fontWeight: '900', color: '#000000', textDecoration: 'none', letterSpacing: '2px', fontFamily: "'Roboto', sans-serif" }}>
            FITMART
          </Link>
        </div>

        {/* Các nút bấm Icon Hành động và Search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', flex: 1, position: 'relative' }}>
          {isSearchActive ? (
            <div style={{ display: 'flex', alignItems: 'center', position: 'absolute', right: '0', backgroundColor: '#ffffff', padding: '0 10px', zIndex: 10 }}>
              <Search 
                placeholder="Bạn đang tìm kiếm điều gì?" 
                allowClear
                autoFocus
                onBlur={() => setTimeout(() => setIsSearchActive(false), 200)}
                enterButton={<SearchOutlined style={{ color: '#000000' }} />}
                style={{ width: '300px' }}
              />
              <CloseOutlined 
                className="nav-icon"
                style={{ marginLeft: '16px', fontSize: '20px' }}
                onClick={() => setIsSearchActive(false)}
              />
            </div>
          ) : (
            <SearchOutlined 
              className="nav-icon" 
              onClick={() => setIsSearchActive(true)}
            />
          )}

          <Link to="/profile">
            <UserOutlined className="nav-icon" />
          </Link>
          <Link to="/wishlist">
            <HeartOutlined className="nav-icon" />
          </Link>
          <Link to="/cart">
            <Badge count={2} color="#ffffff" style={{ color: '#000000', fontWeight: 'bold' }} offset={[-2, 6]}>
              <ShoppingCartOutlined className="nav-icon" />
            </Badge>
          </Link>
        </div>
      </Header>
    </>
  );
};

export default Navbar;