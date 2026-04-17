import React from 'react';
import { Card, Row, Col, Typography, Button, Tag } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

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
    <div>
      <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '20px' }}>
        <Title level={2} style={{ margin: 0 }}>Sản Phẩm Nổi Bật</Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Thiết bị và phụ kiện thể thao chất lượng cao dành cho bạn
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {mockProducts.map((item) => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
            <Card
              hoverable
              cover={
                <img 
                  alt={item.name} 
                  src={item.image} 
                  style={{ height: 240, objectFit: 'cover' }} 
                />
              }
              actions={[
                <Button type="primary" icon={<ShoppingCartOutlined />} style={{ width: '80%' }}>
                  Thêm vào giỏ
                </Button>
              ]}
              style={{ overflow: 'hidden' }}
            >
              {item.tag && (
                <Tag color="red" style={{ position: 'absolute', top: 12, left: 12 }}>
                  {item.tag}
                </Tag>
              )}
              <Meta 
                title={item.name} 
                description={
                  <strong style={{ color: '#f5222d', fontSize: '18px' }}>
                    {formatPrice(item.price)}
                  </strong>
                } 
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default HomePage;