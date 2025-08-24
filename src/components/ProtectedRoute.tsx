
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/ManualAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { isAuthenticated, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRoles.length > 0 && profile && !requiredRoles.includes(profile.role)) {
    // Redirect data_entry users to their appropriate page instead of unauthorized
    if (profile.role === 'data_entry') {
      return <Navigate to="/wirs" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
