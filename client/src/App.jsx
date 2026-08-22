import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';
import AttendanceView from './pages/attendance/AttendanceView';
import AdminAttendance from './pages/attendance/AdminAttendance';
import ApplyLeave from './pages/leave/ApplyLeave';
import LeaveStatus from './pages/leave/LeaveStatus';
import LeaveApproval from './pages/leave/LeaveApproval';
import LoginView from './pages/auth/LoginView';

// Module 3 imports
import PayrollView from './pages/payroll/PayrollView';
import PayrollAdmin from './pages/payroll/PayrollAdmin';
import ReportsDashboard from './pages/reports/ReportsDashboard';
import './App.css';

const App = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdminOrHR = user?.role === 'Admin' || user?.role === 'HR_Officer';

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route
          path="/login"
          element={
            user ? <Navigate to="/dashboard" replace /> : <LoginView onLoginSuccess={(usr) => setUser(usr)} />
          }
        />

        {/* Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <EmployeeDashboard user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Protected Attendance Routes */}
        <Route
          path="/attendance"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <AttendanceView />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Admin Attendance Overview Route */}
        <Route
          path="/admin/attendance"
          element={
            user && isAdminOrHR ? (
              <Layout user={user} onLogout={handleLogout}>
                <AdminAttendance />
              </Layout>
            ) : (
              <Navigate to={user ? "/attendance" : "/login"} replace />
            )
          }
        />

        {/* Protected Leave Routes */}
        <Route
          path="/leave/apply"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <ApplyLeave />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/leave/my-leaves"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <LeaveStatus />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Admin/HR Protected Leave Approvals Route */}
        <Route
          path="/admin/leave/approvals"
          element={
            user && isAdminOrHR ? (
              <Layout user={user} onLogout={handleLogout}>
                <LeaveApproval />
              </Layout>
            ) : (
              <Navigate to={user ? "/attendance" : "/login"} replace />
            )
          }
        />

        {/* Module 3: Payroll Routes */}
        <Route
          path="/payroll"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <PayrollView showToast={showToast} />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/payroll"
          element={
            user && isAdminOrHR ? (
              <Layout user={user} onLogout={handleLogout}>
                <PayrollAdmin showToast={showToast} />
              </Layout>
            ) : (
              <Navigate to={user ? "/payroll" : "/login"} replace />
            )
          }
        />
        <Route
          path="/admin/reports"
          element={
            user && isAdminOrHR ? (
              <Layout user={user} onLogout={handleLogout}>
                <ReportsDashboard showToast={showToast} />
              </Layout>
            ) : (
              <Navigate to={user ? "/payroll" : "/login"} replace />
            )
          }
        />
        <Route
          path="/reports"
          element={<Navigate to="/admin/reports" replace />}
        />

        {/* Default / Fallback Routes */}
        <Route
          path="/"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
