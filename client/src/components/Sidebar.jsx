import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Clock, DollarSign, BarChart3, Bell, UserCheck, ShieldCheck } from 'lucide-react';

export default function Sidebar() {
  const employeeItems = [
    { path: '/payroll', label: 'My Payroll', icon: DollarSign },
    { path: '/attendance', label: 'My Attendance', icon: Clock },
    { path: '/leave', label: 'My Leave', icon: Calendar },
    { path: '/notifications', label: 'Notifications', icon: Bell },
  ];

  const adminItems = [
    { path: '/admin/payroll', label: 'Admin Payroll', icon: ShieldCheck },
    { path: '/admin/reports', label: 'Executive Reports', icon: BarChart3 },
  ];

  return (
    <aside style={{ width: '240px', background: '#0f172a', color: '#f8fafc', height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid #1e293b' }}>
      
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: '#2563eb', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UserCheck size={20} color="#ffffff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>Dayflow</h2>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>HR Management System</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
        
        {/* Employee Section */}
        <div>
          <span style={{ padding: '0 12px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Employee Portal
          </span>
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {employeeItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.925rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#ffffff' : '#94a3b8',
                    background: isActive ? '#1e293b' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease-in-out',
                  })}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Admin / HR Section */}
        <div>
          <span style={{ padding: '0 12px', fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Admin & HR Control
          </span>
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {adminItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.925rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#ffffff' : '#94a3b8',
                    background: isActive ? '#1e293b' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease-in-out',
                  })}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

      </nav>

      {/* User Info Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1e293b', border: '1px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#38bdf8' }}>
          HR
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Sarah HR (HR001)
          </div>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>HR Officer</span>
        </div>
      </div>

    </aside>
  );
}
