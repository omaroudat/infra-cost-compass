
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ManualAuthProvider } from './context/ManualAuthContext';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import { useRealtime } from './hooks/useRealtime';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ManagementDashboard from './pages/ManagementDashboard';
import BOQ from './pages/BOQ';
import Breakdown from './pages/Breakdown';
import Adjustments from './pages/Adjustments';
import WIRs from './pages/WIRs';
import ProgressTracking from './pages/ProgressTracking';
import ProgressSummary from './pages/ProgressSummary';
import Reports from './pages/Reports';
import Invoices from './pages/Invoices';
import Attachments from './pages/Attachments';
import StaffManagement from './pages/StaffManagement';
import UserManagement from './pages/UserManagement';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import AuditHistory from './pages/AuditHistory';
import Index from './pages/Index';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

// Component to initialize realtime
const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useRealtime();
  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ManualAuthProvider>
          <AppProvider>
            <LanguageProvider>
              <RealtimeProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute requiredRoles={['admin', 'editor', 'viewer', 'management']}>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/management"
                    element={
                      <ProtectedRoute requiredRoles={['admin', 'editor', 'viewer', 'management']}>
                        <Layout>
                          <ManagementDashboard />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/boq"
                    element={
                      <ProtectedRoute requiredRoles={['admin', 'editor']}>
                        <Layout>
                          <BOQ />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/breakdown"
                    element={
                      <ProtectedRoute requiredRoles={['admin', 'editor']}>
                        <Layout>
                          <Breakdown />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/adjustments"
                    element={
                      <ProtectedRoute requiredRoles={['admin', 'editor']}>
                        <Layout>
                          <Adjustments />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/wirs"
                    element={
                      <ProtectedRoute requiredRoles={['admin', 'editor', 'data_entry']}>
                        <Layout>
                          <WIRs />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/progress"
                    element={
                      <ProtectedRoute requiredRoles={['admin', 'editor', 'viewer']}>
                        <Layout>
                          <ProgressTracking />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/progress-summary"
                    element={
                      <ProtectedRoute requiredRoles={['admin', 'editor', 'viewer']}>
                        <Layout>
                          <ProgressSummary />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute requiredRoles={['admin', 'editor', 'viewer', 'management']}>
                        <Layout>
                          <Reports />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/invoices"
                    element={
                      <ProtectedRoute requiredRoles={['admin', 'editor', 'viewer', 'management']}>
                        <Layout>
                          <Invoices />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/attachments"
                    element={
                      <ProtectedRoute requiredRoles={['admin']}>
                        <Layout>
                          <Attachments />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/staff"
                    element={
                      <ProtectedRoute requiredRoles={['admin']}>
                        <Layout>
                          <StaffManagement />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute requiredRoles={['admin']}>
                        <Layout>
                          <UserManagement />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/audit"
                    element={
                      <ProtectedRoute requiredRoles={['admin']}>
                        <Layout>
                          <AuditHistory />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </RealtimeProvider>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                }}
              />
            </LanguageProvider>
          </AppProvider>
        </ManualAuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
