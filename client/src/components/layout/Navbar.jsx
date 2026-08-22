import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Bell, User } from 'lucide-react';

const Navbar = ({ user }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6">
      {/* Date & Time Widget */}
      <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
        <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>{time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-mono text-slate-200">{time.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Right Action Icons & User Badge */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500"></span>
        </button>

        <div className="h-6 w-px bg-slate-800"></div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-500/30">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <span className="text-xs font-semibold text-slate-200 hidden sm:inline">{user?.name}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
