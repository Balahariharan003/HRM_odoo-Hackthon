import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, User, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const profile = user?.profile;

  const getInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    }
    if (profile?.firstName) {
      return profile.firstName[0].toUpperCase();
    }
    return user?.employeeId ? user.employeeId.slice(0, 2).toUpperCase() : 'U';
  };

  const displayName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : profile?.firstName || user?.employeeId || 'User';

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Left Side: Mobile Menu Button & Dayflow Logo */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onToggleSidebar}
            type="button"
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-500 transition-all">
              DF
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              Dayflow <span className="text-indigo-500 font-extrabold">HRMS</span>
            </span>
          </Link>
        </div>

        {/* Right Side: User Details & Actions */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <Link to="/profile" className="relative group">
              {profile?.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={displayName}
                  className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500/30 group-hover:border-indigo-400 transition-colors"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs flex items-center justify-center group-hover:bg-indigo-600/30 transition-colors">
                  {getInitials()}
                </div>
              )}
            </Link>

            {/* Name & Role Badge (Hidden on small mobile) */}
            <div className="hidden sm:block text-left">
              <Link to="/profile" className="block text-sm font-semibold text-white hover:text-indigo-300 transition-colors leading-tight">
                {displayName}
              </Link>
              <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Shield className="w-2.5 h-2.5 mr-1" />
                {user?.role || 'Employee'}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 shadow-sm transition-all"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
