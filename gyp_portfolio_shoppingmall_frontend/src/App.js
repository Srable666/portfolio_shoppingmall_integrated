import './App.css';

import { App as AntApp, ConfigProvider } from 'antd';
import { createGlobalStyle } from 'styled-components';
import { Routes, Route, Navigate } from 'react-router-dom';
import theme, { createGlobalStyles } from './styles/theme';

import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { ResponsiveProvider } from './contexts/ResponsiveContext';

import UserOnlyRoute from './components/UserOnlyRoute';
import GuestOnlyRoute from './components/GuestOnlyRoute';
import AdminOnlyRoute from './components/AdminOnlyRoute';

import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import OrderPage from './pages/OrderPage';
import OrderInfo from './pages/MyPageOrderInfo';
import RegisterPage from './pages/RegisterPage';
import ProductDetail from './pages/ProductDetail';
import ProductListPage from './pages/ProductListPage';
import OrderProcessPage from './pages/OrderProcessPage';
import OrderCompletePage from './pages/OrderCompletePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UserInfoManagement from './pages/MyPageUserInfoManagement';

import AdminLogin from './pages/AdminLogin';
import AdminUsers from './pages/AdminUsers';
import AdminOrders from './pages/AdminOrders';
import AdminReviews from './pages/AdminReviews';
import AdminPayments from './pages/AdminPayments';
import AdminProducts from './pages/AdminProducts';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';

// 전역 스타일 적용
const GlobalStyle = createGlobalStyle`
    ${createGlobalStyles()}
`;

function App() {
  return (
    <ConfigProvider theme={theme}>
      <GlobalStyle />
      <AntApp>
        <AuthProvider> 
          <PaymentProvider>
            <CartProvider>
              <ResponsiveProvider>
                <Routes>
                  {/* 모든 사용자 접근 가능 */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="/products" element={<ProductListPage />} /> 
                    <Route path="/:categoryCode" element={<ProductListPage />} />
                    <Route path="/:categoryCode/:productCode" element={<ProductDetail />} />
                  </Route>

                  {/* 로그인한 일반 회원만 접근 가능 */}
                  <Route element={<UserOnlyRoute />}>
                    <Route path="/" element={<Layout />}>
                      <Route path="cart" element={<CartPage />} />
                      <Route path="order" element={<OrderPage />} />
                      <Route path="order/process" element={<OrderProcessPage />} />
                      <Route path="order/complete" element={<OrderCompletePage />} />
                      <Route path="mypage/orderinfo" element={<OrderInfo />} />
                      <Route path="mypage/userinfo" element={<UserInfoManagement />} />
                    </Route>
                  </Route>

                  {/* 비로그인 사용자만 접근 가능 */}
                  <Route element={<GuestOnlyRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                  </Route>

                  {/* 관리자만 접근 가능 */}
                  <Route element={<AdminOnlyRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Navigate to="/admin/dashboard" replace />} />
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="reviews" element={<AdminReviews />} />
                      <Route path="payments" element={<AdminPayments />} />
                    </Route>
                  </Route>

                  {/* 관리자 로그인 페이지 */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                </Routes>
              </ResponsiveProvider>
            </CartProvider>
          </PaymentProvider>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
