import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const OperatorProtectedRoute: React.FC = () => {
  const { user, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/belepes" replace />;
  }

  // Not an operator - redirect to home
  if (userRole?.role !== 'operator_admin' && userRole?.role !== 'operator_staff') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default OperatorProtectedRoute;
