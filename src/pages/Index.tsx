
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/ManualAuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  
  useEffect(() => {
    // Don't navigate while authentication is still loading
    if (loading) return;
    
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/auth', { replace: true });
    }
  }, [navigate, isAuthenticated, loading]);
  
  // Show a simple loading state while determining where to redirect
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Redirecting...</div>
    </div>
  );
};

export default Index;
