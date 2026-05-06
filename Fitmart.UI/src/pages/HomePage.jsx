import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import HeroBanner from '../components/HeroBanner';
import { ProductCard } from '../components/ProductCard';

const { Title } = Typography;

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API từ ASP.NET Core Backend
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5049/api/Products?pageSize=8');
        const data = await response.json();
        
        if (data.items) {
          setProducts(data.items);
        }
      } catch (error) {
        console.error("Lỗi khi fetch sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    const antIcon = <LoadingOutlined style={{ fontSize: 48, color: '#000' }} spin />;
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}><Spin indicator={antIcon} /></div>;
  }

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingBottom: '50px' }}>
      {/* Hero Banner — 21st.dev component, Gymshark-styled */}
      <HeroBanner />

      {/* SẢN PHẨM MỚI TỪ API */}
      <div style={{ padding: '0 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '60px' }}>
          <Title level={2} style={{ margin: 0, fontWeight: 900, textTransform: 'uppercase', color: '#000', fontSize: '40px', letterSpacing: '2px' }}>SẢN PHẨM MỚI</Title>
          <div style={{ width: '80px', height: '4px', backgroundColor: '#000000', margin: '16px auto 0' }}></div>
        </div>

        <Row gutter={[32, 32]}>
          {products.map((item) => {
            const images = item.productVariants && item.productVariants.length > 0 
                ? [...new Set(item.productVariants.map(v => v.imageUrl))]
                : ['https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&q=80'];

            return (
            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
              <ProductCard
                images={images}
                title={item.name}
                description={item.collection ? item.collection.toUpperCase() : 'SẢN PHẨM MỚI'}
                price={formatPrice(item.price * 25000)}
              />
            </Col>
            );
          })}
        </Row>
      </div>

      {/* FEATURED / NỔI BẬT */}
      <div style={{ padding: '0 60px', marginTop: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <Title level={2} style={{ margin: 0, fontWeight: 900, textTransform: 'uppercase', color: '#000', fontSize: '40px', letterSpacing: '2px' }}>SẢN PHẨM NỔI BẬT</Title>
          <div style={{ width: '80px', height: '4px', backgroundColor: '#000000', margin: '16px auto 0' }}></div>
        </div>

        <Row gutter={[32, 32]}>
          {products.filter(p => p.isFeatured).slice(0, 4).map((item) => {
            const images = item.productVariants && item.productVariants.length > 0 
                ? [...new Set(item.productVariants.map(v => v.imageUrl))]
                : ['https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&q=80'];
            
            return (
            <Col xs={24} sm={12} md={8} lg={6} key={`featured-${item.id}`}>
              <ProductCard
                images={images}
                title={item.name}
                description={item.collection ? item.collection.toUpperCase() : 'NỔI BẬT'}
                price={formatPrice(item.price * 25000)}
              />
            </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
};

export default HomePage;