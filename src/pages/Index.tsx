
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/ManualAuthContext';
import ConnectionTest from '@/components/ConnectionTest';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [showConnectionTest, setShowConnectionTest] = useState(false);
  
  useEffect(() => {
    // Don't navigate while authentication is still loading
    if (loading) return;
    
    // Show connection test after 3 seconds if still on this page
    const timer = setTimeout(() => {
      setShowConnectionTest(true);
    }, 3000);
    
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
      clearTimeout(timer);
    } else {
      navigate('/auth', { replace: true });
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
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
    <div className="min-h-screen flex items-center justify-center p-4">
      {showConnectionTest ? (
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Connection Issue Detected</h2>
            <p className="text-gray-600">Running diagnostic test...</p>
          </div>
          <ConnectionTest />
        </div>
      ) : (
        <div className="text-lg">Redirecting...</div>
      )}
    </div>
  );
};

export default Index;
