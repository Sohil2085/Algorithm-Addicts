import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
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

  if (loading) return <div>Loading...</div>;

  if (isAuthenticated) {
    if (user.role === 'MSME') return <Navigate to="/msme" />;
    if (user.role === 'LENDER') return <Navigate to="/lender" />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
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

          {/* Protected Routes - Lender */}
          <Route path="/lender" element={
            <ProtectedRoute allowedRoles={['LENDER']}>
              <LenderDashboard />
            </ProtectedRoute>
          } />

          {/* Protected Routes - Admin */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Shared Protected Routes */}
          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['MSME', 'LENDER']}>
              <Analytics />
            </ProtectedRoute>
          } />

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;