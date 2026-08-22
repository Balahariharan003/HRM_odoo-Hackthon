import React from 'react';
import { DollarSign, Clock, Sparkles } from 'lucide-react';

const PayrollView = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
          <DollarSign className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Module 3 Feature</span>
          </span>
          <h1 className="text-3xl font-extrabold text-white">Payroll Module Coming Soon</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Automated salary calculations, payslip generation, tax deductions, and direct deposit history coming in Module 3.
          </p>
        </div>
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Under Active Development</span>
        </div>
      </div>
    </div>
  );
};

export default PayrollView;
