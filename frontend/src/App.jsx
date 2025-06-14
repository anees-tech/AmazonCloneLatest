import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import HomePage from "./pages/HomePage"
import Login from "./pages/LoginPage"
import Register from "./pages/RegisterPage"
import Footer from "./components/Footer"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProducts from "./pages/admin/AdminProducts"
import AdminCategories from "./pages/admin/AdminCategories"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminOrders from "./pages/admin/AdminOrders"
import AdminProtectedRoutes from "./components/AdminRoute"
import AdminLayout from "./components/admin/AdminLayout"
import AllProductsPage from "./pages/AllProductsPage"
import ProductDetailsPage from "./pages/ProductDetailsPage"
import CartPage from "./pages/CartPage"
import CheckoutPage from "./pages/CheckoutPage"
import OrderSuccessPage from "./pages/OrderSuccessPage"
import ErrorBoundary from "./components/ErrorBoundary"
import { CartProvider } from "./context/CartContext"
import ForgotPassword from "./pages/ForgotPasswordPage"
import UserDashboard from "./pages/UserDashboard"
import OrderDetailsPage from "./pages/OrderDetailsPage"

function App() {
  return (
    <div className="app">
      <CartProvider>
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <ErrorBoundary>
                  <Navbar />
                  <HomePage />
                  <Footer />
                </ErrorBoundary>
              }
            />
            <Route
              path="/login"
              element={
                <ErrorBoundary>
                  <Navbar />
                  <Login />
                  <Footer />
                </ErrorBoundary>
              }
            />
            <Route
              path="/products"
              element={
                <ErrorBoundary>
                  <AllProductsPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="/product/:id"
              element={
                <ErrorBoundary>
                  <ProductDetailsPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="/cart"
              element={
                <ErrorBoundary>
                  <CartPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="/checkout"
              element={
                <ErrorBoundary>
                  <CheckoutPage />
                </ErrorBoundary>
              }
            />

            <Route
              path="/order/:orderId"
              element={
                <ErrorBoundary>
                  <OrderDetailsPage />
                </ErrorBoundary>
              }
            />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/order-success"
              element={
                <ErrorBoundary>
                  <OrderSuccessPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="/register"
              element={
                <ErrorBoundary>
                  <Navbar />
                  <Register />
                  <Footer />
                </ErrorBoundary>
              }
            />
            <Route path="/dashboard" element={<UserDashboard />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ErrorBoundary>
                  <AdminProtectedRoutes>
                    <AdminLayout />
                  </AdminProtectedRoutes>
                </ErrorBoundary>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </CartProvider>
    </div>
  )
}

export default App
