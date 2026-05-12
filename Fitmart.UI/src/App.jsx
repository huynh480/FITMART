import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import { BackgroundPaths } from './components/ui/background-paths';
import './App.css';

const Cart = () => <div style={{padding:'80px 60px'}}><h1>Giỏ hàng</h1><p>Các sản phẩm đã chọn</p></div>;
const Admin = () => <div style={{padding:'80px 60px'}}><h1>Trang Quản lý Admin</h1><p>Thêm/Xóa/Sửa sản phẩm và danh mục</p></div>;

const { Content, Footer } = Layout;

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#000000',
          colorText: '#000000',
          colorTextSecondary: '#6e6e6e',
          colorTextLightSolid: '#ffffff',
          colorBgBase: '#ffffff',
          colorBgContainer: '#ffffff',
          fontFamily: "'Inter', sans-serif",
          borderRadius: 4,
        },
        components: {
          Button: {
            controlHeight: 48,
            fontSize: 16,
            fontWeight: 600,
          },
          Card: {
            colorBorderSecondary: '#333333',
          }
        }
      }}
    >
      <Router>
        <Layout style={{ minHeight: '100vh', background: '#ffffff' }}>
          <Navbar />
          <Content style={{ flex: 1 }}>
            <Routes>
              <Route path='/' element={<HomePage />} />
              <Route path='/cart' element={<Cart />} />
              <Route path='/admin' element={<Admin />} />
              <Route path='/demo' element={<BackgroundPaths title="FITMART" />} />
              <Route path='/collections/*' element={<CollectionPage />} />
              <Route path='/profile' element={<div style={{padding:'80px 60px'}}><h1>Tài khoản</h1></div>} />
              <Route path='/wishlist' element={<div style={{padding:'80px 60px'}}><h1>Yêu thích</h1></div>} />
            </Routes>
          </Content>
          <Footer style={{ textAlign: 'center', background: '#ffffff', color: '#6e6e6e', borderTop: 'none' }}>
            FITMART ©{new Date().getFullYear()} Created with React & Ant Design
          </Footer>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
