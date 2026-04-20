import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, ConfigProvider, theme } from 'antd';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import { BackgroundPaths } from './components/ui/background-paths';
import './App.css';

const Cart = () => <div><h1>Giỏ hàng</h1><p>Các sản phẩm đã chọn</p></div>;
const Admin = () => <div><h1>Trang Quản lý Admin</h1><p>Thêm/Xóa/Sửa sản phẩm và danh mục</p></div>;

const { Content, Footer } = Layout;

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#ffffff',
          colorTextLightSolid: '#000000',
          colorBgBase: '#000000',
          colorBgContainer: '#141414',
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
        <Layout style={{ minHeight: '100vh', background: '#000000' }}>
          <Navbar />
          <Content style={{ flex: 1 }}>
            <Routes>
              <Route path='/' element={<HomePage />} />
              <Route path='/cart' element={<Cart />} />
              <Route path='/admin' element={<Admin />} />
              <Route path='/demo' element={<BackgroundPaths title="FITMART" />} />
            </Routes>
          </Content>
          <Footer style={{ textAlign: 'center', background: '#000000', color: '#888', borderTop: '1px solid #222' }}>
            FITMART ©{new Date().getFullYear()} Created with React & Ant Design
          </Footer>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
