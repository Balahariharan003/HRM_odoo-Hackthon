import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  Users,
  CheckSquare,
  DollarSign,
  Settings,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { role, logout } = useAuth();
  const location = useLocation();

  const isAdminOrHR = role === 'Admin' || role === 'HR_Officer';

  const employeeNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'Attendance', path: '/attendance', icon: Clock },
    { label: 'Apply Leave', path: '/leave/apply', icon: CalendarDays },
    { label: 'My Leaves', path: '/leave/my-leaves', icon: CheckSquare },
    { label: 'Payroll', path: '/payroll', icon: DollarSign },
  ];

  const adminNavItems = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Attendance Records', path: '/admin/attendance', icon: Clock },
    { label: 'Leave Approvals', path: '/admin/leave/approvals', icon: CheckSquare },
    { label: 'Payroll Admin', path: '/admin/payroll', icon: DollarSign },
    { label: 'Reports', path: '/admin/reports', icon: Users },
    { label: 'My Profile', path: '/profile', icon: User },
  ];

  const navItems = isAdminOrHR ? adminNavItems : employeeNavItems;

  return (
    <>
      {/* Mobile Backdrop Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header with Close Button */}
        <div className="flex items-center justify-between p-4 md:hidden border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              DF
            </div>
            <span className="font-bold text-white text-base">Dayflow HRMS</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Header */}
        <div className="px-6 pt-6 pb-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
            {isAdminOrHR ? 'Administration' : 'Employee Portal'}
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Check if current location starts with item path (for sub-routes like /profile/edit)
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' &&
                item.path !== '/dashboard' &&
                item.path !== '/admin/dashboard' &&
                location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={onClose}
                className={
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/25 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-semibold border border-rose-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
