import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

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

// Inventory
import BatchesPage from '../pages/inventory/BatchesPage';
import ExpiringPage from '../pages/inventory/ExpiringPage';
import AdjustmentPage from '../pages/inventory/AdjustmentPage';

// Secondary Modules
import CategoriesPage from '../pages/categories/CategoriesPage';
import SuppliersPage from '../pages/suppliers/SuppliersPage';
import StaffPage from '../pages/staff/StaffPage';

// Reports
import RevenueReportPage from '../pages/reports/RevenueReportPage';
import ProfitReportPage from '../pages/reports/ProfitReportPage';
import TopProductsPage from '../pages/reports/TopProductsPage';
import InventoryReportPage from '../pages/reports/InventoryReportPage';

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
          {
            path: 'inventory',
            children: [
              { path: 'batches', element: <BatchesPage /> },
              { path: 'expiring', element: <ExpiringPage /> },
              { path: 'adjust', element: <AdminRoute />, children: [{ path: '', element: <AdjustmentPage /> }] },
            ]
          },

          // Reports
          {
            path: 'reports',
            children: [
              { index: true, element: <Navigate to="revenue" replace /> },
              { path: 'revenue', element: <RevenueReportPage /> },
              { path: 'profit', element: <ProfitReportPage /> },
              { path: 'top-products', element: <TopProductsPage /> },
              { path: 'inventory', element: <InventoryReportPage /> },
            ]
          },

          // Secondary Admin Modules
          {
            path: '/',
            element: <AdminRoute />,
            children: [
              { path: 'categories', element: <CategoriesPage /> },
              { path: 'suppliers', element: <SuppliersPage /> },
              { path: 'staff', element: <StaffPage /> },
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
