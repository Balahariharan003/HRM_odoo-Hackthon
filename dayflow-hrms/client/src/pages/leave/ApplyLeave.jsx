import React from 'react';
import { CalendarDays, Clock, Sparkles } from 'lucide-react';

const ApplyLeave = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-400 mx-auto">
          <CalendarDays className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Module 2 Feature</span>
          </span>
          <h1 className="text-3xl font-extrabold text-white">Leave Management Coming Soon</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Apply for paid leave, track vacation balances, and manage multi-level HR approval workflows coming in Module 2.
          </p>
        </div>
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Under Active Development</span>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
