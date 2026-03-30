import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Guards
import { PrivateRoute, AdminRoute, PublicRoute } from './guards';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ProductListPage from '../pages/products/ProductListPage';
import ProductFormPage from '../pages/products/ProductFormPage';
import ProductDetailPage from '../pages/products/ProductDetailPage';
import PurchaseOrderListPage from '../pages/purchase-orders/PurchaseOrderListPage';
import PurchaseOrderFormPage from '../pages/purchase-orders/PurchaseOrderFormPage';
import POSPage from '../pages/sales/POSPage';
import SalesHistoryPage from '../pages/sales/SalesHistoryPage';
import InventoryPage from '../pages/inventory/InventoryPage';
import CategoryPage from '../pages/categories/CategoryPage';
import SupplierPage from '../pages/suppliers/SupplierPage';
import ReportPage from '../pages/reports/ReportPage';
import UserManagementPage from '../pages/settings/UserManagementPage';

export const router = createBrowserRouter([
  // Private Routes (Require Login)
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          
          // Products
          { path: 'products', element: <ProductListPage /> },
          { path: 'products/new', element: <AdminRoute />, children: [{ path: '', element: <ProductFormPage /> }] },
          { path: 'products/:id', element: <ProductDetailPage /> },
          { path: 'products/:id/edit', element: <AdminRoute />, children: [{ path: '', element: <ProductFormPage /> }] },

          // Purchase Orders
          { path: 'purchase-orders', element: <PurchaseOrderListPage /> },
          { path: 'purchase-orders/new', element: <AdminRoute />, children: [{ path: '', element: <PurchaseOrderFormPage /> }] },

          // Sales / POS
          { path: 'pos', element: <POSPage /> },
          { path: 'sales-history', element: <SalesHistoryPage /> },

          // Inventory
          { path: 'inventory', element: <InventoryPage /> },

          // Admin Only Routes
          {
            path: '/',
            element: <AdminRoute />,
            children: [
              { path: 'categories', element: <CategoryPage /> },
              { path: 'suppliers', element: <SupplierPage /> },
              { path: 'reports', element: <ReportPage /> },
              { path: 'settings/users', element: <UserManagementPage /> },
            ]
          }
        ]
      }
    ]
  },
  
  // Public Routes (Unauthenticated)
  {
    path: '/login',
    element: <PublicRoute />,
    children: [
      {
        path: '',
        element: <AuthLayout />,
        children: [
          { index: true, element: <LoginPage /> }
        ]
      }
    ]
  },

  // Fallback
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
]);
