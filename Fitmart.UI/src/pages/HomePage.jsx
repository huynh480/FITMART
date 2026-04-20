import React from 'react';
import { Card, Row, Col, Typography, Button, Tag } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import HeroBanner from '../components/HeroBanner';

const { Title, Text } = Typography;
const { Meta } = Card;

const mockProducts = [
  {
    id: 1,
    name: 'Tạ Đơn Cao Su Tròn 5kg',
    price: 150000,
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&q=80',
    tag: 'Bán chạy'
  },
  {
    id: 2,
    name: 'Thảm Tập Yoga TPE Chống Trượt',
    price: 220000,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&q=80',
    tag: 'Mới'
  },
  {
    id: 3,
    name: 'Whey Protein Phục Hồi Cơ (2.5kg)',
    price: 1250000,
    image: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=500&q=80'
  },
  {
    id: 4,
    name: 'Dây Kháng Lực Đa Năng (Bộ 5 dây)',
    price: 185000,
    image: 'https://images.unsplash.com/photo-1598266663439-2056e6900339?w=500&q=80'
  },
  {
    id: 5,
    name: 'Giày Chạy Bộ Chuyên Dụng Nam',
    price: 850000,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80'
  },
  {
    id: 6,
    name: 'Bình Lắc Thể Thao Shaker 700ml',
    price: 95000,
    image: 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?w=500&q=80'
  },
];

const HomePage = () => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };



  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', paddingBottom: '50px' }}>
      {/* Hero Banner — 21st.dev component, Gymshark-styled */}
      <HeroBanner />

      {/* SẢN PHẨM MỚI */}
      <div style={{ padding: '0 50px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '60px' }}>
          <Title level={2} style={{ margin: 0, fontWeight: 900, textTransform: 'uppercase', color: '#fff', fontSize: '40px', letterSpacing: '2px' }}>SẢN PHẨM MỚI</Title>
          <div style={{ width: '80px', height: '4px', backgroundColor: '#ffffff', margin: '16px auto 0' }}></div>
        </div>

        <Row gutter={[32, 32]}>
          {mockProducts.map((item) => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
              <Card
                hoverable
                className="product-card"
                bodyStyle={{ padding: '20px 20px 0 20px', backgroundColor: '#222' }}
                cover={
                  <div style={{ overflow: 'hidden', aspectRatio: '4/5' }}>
                    <img 
                      alt={item.name} 
                      src={item.image} 
                      className="product-image"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} 
                    />
                  </div>
                }
                style={{ 
                  overflow: 'hidden', 
                  transition: 'all 0.3s ease',
                  border: 'none',
                  borderRadius: '0', // Bỏ viền bo tròn giống thegioidotap
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#222'
                }}
              >
                {item.tag && (
                  <Tag color="#ffffff" style={{ color: '#000000', position: 'absolute', top: 16, left: 16, border: 'none', fontWeight: 'bold', padding: '6px 12px', borderRadius: '2px', fontSize: '12px' }}>
                    {item.tag.toUpperCase()}
                  </Tag>
                )}
                <Meta 
                  title={<span style={{ fontSize: '18px', fontFamily: 'sans-serif', color: '#fff', fontWeight: '600', whiteSpace: 'normal', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</span>} 
                  description={
                    <div style={{ marginTop: '12px', marginBottom: '24px' }}>
                      <strong style={{ color: '#ffffff', fontSize: '22px', fontWeight: '900' }}>
                        {formatPrice(item.price)}
                      </strong>
                    </div>
                  } 
                />
                <Button 
                  type="primary" 
                  icon={<ShoppingCartOutlined />} 
                  style={{ 
                    width: 'calc(100% + 40px)', 
                    backgroundColor: '#ffffff', 
                    color: '#000000',
                    borderRadius: '0',
                    height: '50px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    textTransform: 'uppercase',
                    marginTop: 'auto',
                    border: 'none',
                    marginLeft: '-20px',
                    marginRight: '-20px',
                    padding: '0',
                    boxSizing: 'content-box'
                  }}
                >
                  THÊM VÀO GIỎ
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* FLASH SALE */}
      <div style={{ padding: '0 50px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '80px' }}>
          <Title level={2} style={{ margin: 0, fontWeight: 900, textTransform: 'uppercase', color: '#fff', fontSize: '40px', letterSpacing: '2px' }}>FLASH SALE</Title>
          <div style={{ width: '80px', height: '4px', backgroundColor: '#ffffff', margin: '16px auto 0' }}></div>
        </div>

        <Row gutter={[32, 32]}>
          {mockProducts.slice(0, 4).map((item) => (
            <Col xs={24} sm={12} md={8} lg={6} key={`flash-${item.id}`}>
              <Card
                hoverable
                className="product-card"
                bodyStyle={{ padding: '20px 20px 0 20px', backgroundColor: '#222' }}
                cover={
                  <div style={{ overflow: 'hidden', aspectRatio: '4/5' }}>
                    <img 
                      alt={item.name} 
                      src={item.image} 
                      className="product-image"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} 
                    />
                  </div>
                }
                style={{ 
                  overflow: 'hidden', 
                  transition: 'all 0.3s ease',
                  border: 'none',
                  borderRadius: '0',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#222'
                }}
              >
                <Tag color="#ff0000" style={{ position: 'absolute', top: 16, right: 16, border: 'none', fontWeight: 'bold', padding: '6px 12px', borderRadius: '2px', fontSize: '14px' }}>
                  -20%
                </Tag>
                <Meta 
                  title={<span style={{ fontSize: '18px', fontFamily: 'sans-serif', color: '#fff', fontWeight: '600', whiteSpace: 'normal', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</span>} 
                  description={
                    <div style={{ marginTop: '12px', marginBottom: '24px' }}>
                      <strong style={{ color: '#ffffff', fontSize: '22px', fontWeight: '900', marginRight: '10px' }}>
                        {formatPrice(item.price * 0.8)}
                      </strong>
                      <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '16px' }}>
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  } 
                />
                <Button 
                  type="primary" 
                  icon={<ShoppingCartOutlined />} 
                  style={{ 
                    width: 'calc(100% + 40px)', 
                    backgroundColor: '#ffffff', 
                    color: '#000000',
                    borderRadius: '0',
                    height: '50px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    textTransform: 'uppercase',
                    marginTop: 'auto',
                    border: 'none',
                    marginLeft: '-20px',
                    marginRight: '-20px',
                    padding: '0',
                    boxSizing: 'content-box'
                  }}
                >
                  MUA NGAY
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default HomePage;