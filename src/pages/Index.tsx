
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/ManualAuthContext';
import ConnectionTest from '@/components/ConnectionTest';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [showConnectionTest, setShowConnectionTest] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  useEffect(() => {
    // Don't navigate while authentication is still loading
    if (loading) {
      console.log('Authentication still loading...');
      return;
    }
    
    // Prevent multiple redirect attempts
    if (redirectAttempted) return;
    
    console.log('Authentication loaded. isAuthenticated:', isAuthenticated);
    
    // Show connection test after 2 seconds if still on this page
    const timer = setTimeout(() => {
      if (!redirectAttempted) {
        console.log('Showing connection test due to delayed redirect');
        setShowConnectionTest(true);
      }
    }, 2000);
    
    // Attempt redirect
    if (isAuthenticated) {
      console.log('User authenticated, redirecting to dashboard...');
      setRedirectAttempted(true);
      navigate('/dashboard', { replace: true });
      clearTimeout(timer);
    } else {
      console.log('User not authenticated, redirecting to auth...');
      setRedirectAttempted(true);
      navigate('/auth', { replace: true });
      clearTimeout(timer);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [navigate, isAuthenticated, loading, redirectAttempted]);
  
  // Show a simple loading state while determining where to redirect
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading application...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      {showConnectionTest ? (
        <div className="space-y-6 w-full max-w-2xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Connection Issue Detected</h1>
            <p className="text-gray-600">
              We're having trouble connecting to the database. Running diagnostic tests...
            </p>
          </div>
          <ConnectionTest />
          <div className="text-center">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Redirecting...</div>
        </div>
      )}
    </div>
  );
};

export default Index;
