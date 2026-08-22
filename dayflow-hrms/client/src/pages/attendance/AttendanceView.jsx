import React from 'react';
import { CalendarCheck, Clock, Sparkles } from 'lucide-react';

const AttendanceView = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center text-purple-400 mx-auto">
          <CalendarCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Module 2 Feature</span>
          </span>
          <h1 className="text-3xl font-extrabold text-white">Attendance Module Coming Soon</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Comprehensive clock-in/clock-out tracking, automated shift monitoring, and historical attendance logs will be available in Module 2.
          </p>
        </div>
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold">
          <Clock className="w-4 h-4 text-purple-400" />
          <span>Under Active Development</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceView;
