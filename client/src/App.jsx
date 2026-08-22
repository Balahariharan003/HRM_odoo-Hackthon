import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import PayrollView from './pages/payroll/PayrollView';
import PayrollAdmin from './pages/payroll/PayrollAdmin';
import ReportsDashboard from './pages/reports/ReportsDashboard';
import './App.css';

// Placeholder component for other standard module views
function PlaceholderPage({ title }) {
  return (
    <div style={{ padding: '40px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ color: '#1e293b', margin: '0 0 8px 0' }}>{title}</h2>
      <p style={{ color: '#64748b', margin: 0 }}>Module page view</p>
    </div>
  );
}

export default function App() {
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area with Header Navbar */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Navbar toastMessage={toastMessage} setToastMessage={setToastMessage} />
          
          <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/payroll" replace />} />
              
              {/* Employee Portal Routes */}
              <Route path="/payroll" element={<PayrollView showToast={showToast} />} />
              <Route path="/attendance" element={<PlaceholderPage title="My Attendance" />} />
              <Route path="/leave" element={<PlaceholderPage title="My Leaves" />} />
              <Route path="/notifications" element={<PlaceholderPage title="Notifications Center" />} />

              {/* Admin / HR Control Routes */}
              <Route path="/admin/payroll" element={<PayrollAdmin showToast={showToast} />} />
              <Route path="/admin/reports" element={<ReportsDashboard showToast={showToast} />} />
              <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/payroll" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
