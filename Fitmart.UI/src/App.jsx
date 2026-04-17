import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import './App.css';

const Cart = () => <div><h1>Gi? hàng</h1><p>Các s?n ph?m dã ch?n</p></div>;
const Admin = () => <div><h1>Trang Qu?n lý Admin</h1><p>Thêm/Xóa/S?a s?n ph?m và danh m?c</p></div>;

const { Content, Footer } = Layout;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <Navbar />
        <Content style={{ padding: '0 48px', marginTop: '24px', flex: 1 }}>
          <div style={{ background: '#fff', minHeight: '600px', padding: 24, borderRadius: 8, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
            <Routes>
              <Route path='/' element={<HomePage />} />
              <Route path='/cart' element={<Cart />} />
              <Route path='/admin' element={<Admin />} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center', background: '#f5f5f5', color: '#888' }}>
          Fitmart ©{new Date().getFullYear()} Created with React & Ant Design
        </Footer>
      </Layout>
    </Router>
  );
}

export default App;
