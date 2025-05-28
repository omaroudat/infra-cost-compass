
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
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
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <LanguageProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requiredRoles={['admin', 'dataEntry', 'viewer']}>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/boq"
                  element={
                    <ProtectedRoute requiredRoles={['admin', 'dataEntry']}>
                      <Layout>
                        <BOQ />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/breakdown"
                  element={
                    <ProtectedRoute requiredRoles={['admin', 'dataEntry']}>
                      <Layout>
                        <Breakdown />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/adjustments"
                  element={
                    <ProtectedRoute requiredRoles={['admin', 'dataEntry']}>
                      <Layout>
                        <Adjustments />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wirs"
                  element={
                    <ProtectedRoute requiredRoles={['admin', 'dataEntry', 'viewer']}>
                      <Layout>
                        <WIRs />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/progress"
                  element={
                    <ProtectedRoute requiredRoles={['admin', 'dataEntry', 'viewer']}>
                      <Layout>
                        <ProgressTracking />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute requiredRoles={['admin', 'dataEntry', 'viewer']}>
                      <Layout>
                        <Reports />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/invoices"
                  element={
                    <ProtectedRoute requiredRoles={['admin', 'dataEntry', 'viewer']}>
                      <Layout>
                        <Invoices />
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <Toaster />
          </LanguageProvider>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
