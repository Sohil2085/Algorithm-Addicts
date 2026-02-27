import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FeatureProvider } from './context/FeatureContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import MSMEDashboard from './pages/MSMEDashboard';
import LenderDashboard from './pages/LenderDashboard';
import UploadInvoice from './pages/UploadInvoice';
import Analytics from './pages/Analytics';
import './App.css';
import { Toaster } from 'react-hot-toast'; // Import Toaster
import AdminDashboard from './pages/AdminDashboard';
import SystemControl from './pages/SystemControl';
import WalletPage from './pages/WalletPage';

import Landing from './pages/Landing'; // Import Landing page
import InvoiceList from './pages/InvoiceList';
import KycForm from './pages/KycForm';
import Profile from './pages/Profile';
import AdminKycPage from './pages/AdminKycPage';
import AdminLenderKycPage from './pages/AdminLenderKycPage';
import LenderOnboardingPage from './pages/LenderOnboardingPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-slate-950 flex flex-col pt-16">
        <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-blue-600 rounded-full -z-10 blur-3xl opacity-[0.12] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950 -z-10 pointer-events-none"></div>
        <div className="p-8 space-y-8 animate-pulse flex-1 w-full max-w-7xl mx-auto">
          <div className="h-10 w-64 bg-white/10 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 rounded-2xl border border-white/5"></div>)}
          </div>
          <div className="h-96 bg-white/5 rounded-2xl border border-white/5"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to a generic unauthorized page or home if role doesn't match
    return <Navigate to="/" />; // Or unauthorized page
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-blue-500/20 rounded-full"></div>
          <div className="h-4 w-24 bg-white/10 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (user.role === 'MSME') return <Navigate to="/msme" />;
    if (user.role === 'LENDER') return <Navigate to="/lender" />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" />;
    if (user.role === 'CONTROLLER') return <Navigate to="/system-control" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <FeatureProvider>
          <Navbar />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid rgba(148, 163, 184, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />

            {/* Protected Routes - MSME */}
            <Route path="/msme" element={
              <ProtectedRoute allowedRoles={['MSME']}>
                <MSMEDashboard />
              </ProtectedRoute>
            } />
            <Route path="/upload-invoice" element={
              <ProtectedRoute allowedRoles={['MSME']}>
                <UploadInvoice />
              </ProtectedRoute>
            } />
            <Route path="/invoices" element={
              <ProtectedRoute allowedRoles={['MSME']}>
                <InvoiceList />
              </ProtectedRoute>
            } />
            <Route path="/kyc" element={
              <ProtectedRoute allowedRoles={['MSME']}>
                <KycForm />
              </ProtectedRoute>
            } />

            {/* Protected Routes - Lender */}
            <Route path="/lender" element={
              <ProtectedRoute allowedRoles={['LENDER']}>
                <LenderDashboard />
              </ProtectedRoute>
            } />
            <Route path="/lender/kyc" element={
              <ProtectedRoute allowedRoles={['LENDER']}>
                <LenderOnboardingPage />
              </ProtectedRoute>
            } />

            {/* Protected Routes - Admin */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/kyc" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminKycPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/lender-kyc" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLenderKycPage />
              </ProtectedRoute>
            } />

            {/* Protected Route - Controller */}
            <Route path="/system-control" element={
              <ProtectedRoute allowedRoles={['CONTROLLER']}>
                <SystemControl />
              </ProtectedRoute>
            } />

            {/* Shared Protected Routes */}
            <Route path="/wallet" element={
              <ProtectedRoute allowedRoles={['MSME', 'LENDER']}>
                <WalletPage />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute allowedRoles={['MSME', 'LENDER']}>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['MSME', 'LENDER']}>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Default Redirect */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </FeatureProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
