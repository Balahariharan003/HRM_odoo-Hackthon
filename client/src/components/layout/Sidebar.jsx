import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  FileCheck2, 
  FileSpreadsheet, 
  UserCheck, 
  Users,
  LogOut,
  Building2
} from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  const employeeNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Attendance', path: '/attendance', icon: Clock },
    { name: 'Apply for Leave', path: '/leave/apply', icon: FileSpreadsheet },
    { name: 'My Leaves', path: '/leave/my-leaves', icon: FileCheck2 },
  ];

  const adminNavItems = [
    { name: 'All Attendance', path: '/admin/attendance', icon: Users },
    { name: 'Leave Approvals', path: '/admin/leave/approvals', icon: UserCheck },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Dayflow HRMS
          </h1>
          <p className="text-xs text-slate-400 font-medium">Employee Portal</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Employee Section */}
        <div className="space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Employee Services
          </div>
          {employeeNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Admin / HR Section */}
        {(user?.role === 'Admin' || user?.role === 'HR_Officer') && (
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="px-3 pb-2 text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider">
              Management
            </div>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 text-indigo-400" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>

      {/* User Info & Logout at Bottom */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Employee'}</p>
              <p className="text-[10px] text-indigo-400 font-medium truncate">{user?.role || 'Staff'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
