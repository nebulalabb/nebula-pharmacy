import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

/**
 * Guard for authenticated users only
 */
export const PrivateRoute: React.FC = () => {
  const { token } = useAuthStore();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

/**
 * Guard for Admin role only
 */
export const AdminRoute: React.FC = () => {
  const { user } = useAuthStore();
  
  if (!user || user.role !== 'ADMIN') {
    // Redirect to dashboard if not an admin
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};

/**
 * Guard for unauthenticated users (e.g. Login page)
 */
export const PublicRoute: React.FC = () => {
  const { token } = useAuthStore();
  // Redirect to dashboard if already logged in
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
};
