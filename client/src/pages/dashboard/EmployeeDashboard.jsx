import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  CalendarCheck,
  Palmtree,
  LogOut,
  Clock,
  CheckCircle2,
  UserCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const firstName = user?.profile?.firstName || user?.employeeId || 'Employee';

  // Format today's date: e.g. "Saturday, August 22, 2026"
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const cards = [
    {
      id: 'profile',
      title: 'My Profile',
      subtitle: 'View and edit your details',
      icon: User,
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      hoverBorder: 'hover:border-blue-500/50',
      action: () => navigate('/profile'),
    },
    {
      id: 'attendance',
      title: 'Attendance',
      subtitle: 'View your attendance records',
      icon: CalendarCheck,
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      hoverBorder: 'hover:border-indigo-500/50',
      badge: 'Coming Soon',
      action: () => navigate('/attendance'),
    },
    {
      id: 'leave',
      title: 'Leave Requests',
      subtitle: 'Apply for time off',
      icon: Palmtree,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      hoverBorder: 'hover:border-emerald-500/50',
      badge: 'Coming Soon',
      action: () => navigate('/leave/my-leaves'),
    },
    {
      id: 'logout',
      title: 'Logout',
      subtitle: 'Sign out of your account',
      icon: LogOut,
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      hoverBorder: 'hover:border-rose-500/50',
      accentColor: 'text-rose-400',
      action: () => logout(),
    },
  ];

  const recentActivities = [
    {
      id: 1,
      title: 'You checked in at 09:00 AM today',
      timestamp: 'Today at 09:00 AM',
      icon: Clock,
      iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      id: 2,
      title: 'Your leave request was approved',
      timestamp: 'Yesterday at 04:30 PM',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 3,
      title: 'Profile updated successfully',
      timestamp: '3 days ago',
      icon: UserCheck,
      iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Employee Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {formattedDate}
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950/60 border border-slate-800 px-4 py-3 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center text-sm">
            {user?.employeeId ? user.employeeId.slice(0, 3) : 'EMP'}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Employee ID</p>
            <p className="text-sm font-bold text-white">{user?.employeeId}</p>
          </div>
        </div>
      </div>

      {/* 4 Quick Access Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={card.action}
              className={`group bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer relative overflow-hidden ${card.hoverBorder}`}
            >
              {card.badge && (
                <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {card.badge}
                </span>
              )}

              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${card.iconBg}`}>
                <Icon className="w-6 h-6" />
              </div>

              <h3 className={`text-lg font-bold text-white group-hover:text-blue-400 transition-colors ${card.accentColor || ''}`}>
                {card.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {card.subtitle}
              </p>

              <div className="mt-4 flex items-center text-xs font-semibold text-slate-500 group-hover:text-blue-400 transition-colors">
                <span>Access</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Activity</h2>
            <p className="text-slate-400 text-xs mt-0.5">Your latest account events and system updates</p>
          </div>
          <span className="text-xs text-slate-500 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 font-medium">
            Live Feed
          </span>
        </div>

        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2.5 rounded-xl border ${activity.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {activity.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
