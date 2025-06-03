
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { SupabaseAuthProvider } from './context/SupabaseAuthContext';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import { useRealtime } from './hooks/useRealtime';
import Layout from './components/Layout';
import ProtectedRouteSupabase from './components/ProtectedRouteSupabase';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import BOQ from './pages/BOQ';
import Breakdown from './pages/Breakdown';
import Adjustments from './pages/Adjustments';
import WIRs from './pages/WIRs';
import ProgressTracking from './pages/ProgressTracking';
import Reports from './pages/Reports';
import Invoices from './pages/Invoices';
import StaffManagement from './pages/StaffManagement';
import UserManagement from './pages/UserManagement';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import './App.css';

const queryClient = new QueryClient();

// Component to initialize realtime
const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useRealtime();
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <AppProvider>
          <LanguageProvider>
            <RealtimeProvider>
              <Router>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRouteSupabase>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRouteSupabase>
                    }
                  />
                  <Route
                    path="/boq"
                    element={
                      <ProtectedRouteSupabase requiredRoles={['admin', 'editor']}>
                        <Layout>
                          <BOQ />
                        </Layout>
                      </ProtectedRouteSupabase>
                    }
                  />
                  <Route
                    path="/breakdown"
                    element={
                      <ProtectedRouteSupabase requiredRoles={['admin', 'editor']}>
                        <Layout>
                          <Breakdown />
                        </Layout>
                      </ProtectedRouteSupabase>
                    }
                  />
                  <Route
                    path="/adjustments"
                    element={
                      <ProtectedRouteSupabase requiredRoles={['admin', 'editor']}>
                        <Layout>
                          <Adjustments />
                        </Layout>
                      </ProtectedRouteSupabase>
                    }
                  />
                  <Route
                    path="/wirs"
                    element={
                      <ProtectedRouteSupabase>
                        <Layout>
                          <WIRs />
                        </Layout>
                      </ProtectedRouteSupabase>
                    }
                  />
                  <Route
                    path="/progress"
                    element={
                      <ProtectedRouteSupabase>
                        <Layout>
                          <ProgressTracking />
                        </Layout>
                      </ProtectedRouteSupabase>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRouteSupabase>
                        <Layout>
                          <Reports />
                        </Layout>
                      </ProtectedRouteSupabase>
                    }
                  />
                  <Route
                    path="/invoices"
                    element={
                      <ProtectedRouteSupabase>
                        <Layout>
                          <Invoices />
                        </Layout>
                      </ProtectedRouteSupabase>
                    }
                  />
                  <Route
                    path="/staff"
                    element={
                      <ProtectedRouteSupabase requiredRoles={['admin']}>
                        <Layout>
                          <StaffManagement />
                        </Layout>
                      </ProtectedRouteSupabase>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRouteSupabase requiredRoles={['admin']}>
                        <Layout>
                          <UserManagement />
                        </Layout>
                      </ProtectedRouteSupabase>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </RealtimeProvider>
            <Toaster />
          </LanguageProvider>
        </AppProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
