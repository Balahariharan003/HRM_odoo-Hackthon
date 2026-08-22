import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/protected/ProtectedRoute';
import Layout from './components/Layout/Layout';

import SignUp from './pages/auth/SignUp';
import SignIn from './pages/auth/SignIn';
import VerifyEmail from './pages/auth/VerifyEmail';
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ProfileView from './pages/profile/ProfileView';
import ProfileEdit from './pages/profile/ProfileEdit';
import AttendanceView from './pages/attendance/AttendanceView';
import ApplyLeave from './pages/leave/ApplyLeave';
import PayrollView from './pages/payroll/PayrollView';
import NotFound from './pages/errors/NotFound';
import Unauthorized from './pages/errors/Unauthorized';

const DefaultRedirect = () => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  if (role === 'Admin' || role === 'HR_Officer') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes (No Layout) */}
      <Route path="/" element={<DefaultRedirect />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes (Wrapped in Layout) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<EmployeeDashboard />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/attendance" element={<AttendanceView />} />
          <Route path="/leave" element={<ApplyLeave />} />
          <Route path="/payroll" element={<PayrollView />} />

          {/* Admin / HR Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Admin', 'HR_Officer']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/profile/:userId" element={<ProfileView />} />
            <Route path="/profile/:userId/edit" element={<ProfileEdit />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #1e293b',
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
