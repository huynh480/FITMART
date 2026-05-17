import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { BackgroundPaths } from './components/ui/background-paths';
import { AuthProvider } from './hooks/useAuth';
import './App.css';

/* ── Admin pages ── */
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsPage from './pages/admin/ProductsPage';
import OrdersPage from './pages/admin/OrdersPage';
import UsersPage from './pages/admin/UsersPage';
import CategoriesPage from './pages/admin/CategoriesPage';

const Cart = () => <div style={{padding:'80px 60px'}}><h1>Giỏ hàng</h1><p>Các sản phẩm đã chọn</p></div>;

import Footer from './components/Footer';

const { Content } = Layout;

/**
 * StorefrontLayout — wraps all non-admin routes
 * Shows Navbar + Footer except on auth pages.
 */
function StorefrontLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <Layout style={{ minHeight: '100vh', background: '#ffffff' }}>
      {!isAuthPage && <Navbar />}
      <Content style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Content>
      {!isAuthPage && <Footer />}
    </Layout>
  );
}

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
      <AuthProvider>
        <Router>
          <Routes>
            {/* ── Admin routes ── */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="categories" element={<CategoriesPage />} />
            </Route>

            {/* ── Storefront routes ── */}
            <Route element={<StorefrontLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/demo" element={<BackgroundPaths title="FITMART" />} />
              <Route path="/collections/*" element={<CollectionPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/profile" element={<div style={{padding:'80px 60px'}}><h1>Tài khoản</h1></div>} />
              <Route path="/wishlist" element={<div style={{padding:'80px 60px'}}><h1>Yêu thích</h1></div>} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
