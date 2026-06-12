import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StoreManagement from './pages/StoreManagement';

import BikeManagement from './pages/BikeManagement';
import RentalManagement from './pages/RentalManagement';
import UserManagement from './pages/UserManagement';
import AuditLogs from './pages/AuditLogs';
import DepositSettings from './pages/DepositSettings';
import Settings from './pages/Settings';
import Fines from './pages/Fines';
import './index.css';

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  return admin ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  return admin ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stores" element={<StoreManagement />} />

        <Route path="/bikes" element={<BikeManagement />} />
        <Route path="/rentals" element={<RentalManagement />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/deposit-settings" element={<DepositSettings />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/fines" element={<Fines />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1a1a2e', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.08)' },
        }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
