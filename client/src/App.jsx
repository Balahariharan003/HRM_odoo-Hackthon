import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/protected/ProtectedRoute';
import RoleGuard from './components/protected/RoleGuard';
import Layout from './components/layout/Layout';

// Module 1 Pages
import SignUp from './pages/auth/SignUp';
import SignIn from './pages/auth/SignIn';
import VerifyEmail from './pages/auth/VerifyEmail';
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ProfileView from './pages/profile/ProfileView';
import ProfileEdit from './pages/profile/ProfileEdit';

// Module 2 Pages
import AttendanceView from './pages/attendance/AttendanceView';
import AdminAttendance from './pages/attendance/AdminAttendance';
import ApplyLeave from './pages/leave/ApplyLeave';
import LeaveStatus from './pages/leave/LeaveStatus';
import LeaveApproval from './pages/leave/LeaveApproval';

// Module 3 Pages
import PayrollView from './pages/payroll/PayrollView';
import PayrollAdmin from './pages/payroll/PayrollAdmin';
import ReportsDashboard from './pages/reports/ReportsDashboard';

// Custom Errors
import NotFound from './pages/errors/NotFound';
import Unauthorized from './pages/errors/Unauthorized';

import './App.css';

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
  const showToast = (msg) => {
    toast(msg);
  };

  return (
    <Routes>
      {/* Public Auth Routes (No Layout) */}
      <Route path="/" element={<DefaultRedirect />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/login" element={<Navigate to="/signin" replace />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes (Wrapped in Layout) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* General Employee / Core Routes */}
          <Route path="/dashboard" element={<EmployeeDashboard />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />

          {/* Module 2: Attendance & Leave Employee Routes */}
          <Route path="/attendance" element={<AttendanceView />} />
          <Route path="/leave/apply" element={<ApplyLeave />} />
          <Route path="/leave/my-leaves" element={<LeaveStatus />} />

          {/* Module 3: Payroll Employee Route */}
          <Route path="/payroll" element={<PayrollView showToast={showToast} />} />

          {/* Admin / HR Officer Only Guarded Routes */}
          <Route element={<RoleGuard allowedRoles={['Admin', 'HR_Officer']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/profile/edit/:userId" element={<ProfileEdit />} />

            {/* Module 2: Attendance & Leave Admin Routes */}
            <Route path="/admin/attendance" element={<AdminAttendance />} />
            <Route path="/admin/leave/approvals" element={<LeaveApproval />} />

            {/* Module 3: Payroll & Report Admin Routes */}
            <Route path="/admin/payroll" element={<PayrollAdmin showToast={showToast} />} />
            <Route path="/admin/reports" element={<ReportsDashboard showToast={showToast} />} />
            <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />
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
