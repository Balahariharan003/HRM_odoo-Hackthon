import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Send, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  ShieldAlert,
  HeartPulse,
  DollarSign
} from 'lucide-react';
import leaveService from '../../services/leaveService';
import Toast from '../../components/Toast';

const ApplyLeave = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    leaveType: 'Paid', // 'Paid' | 'Sick' | 'Unpaid'
    startDate: '',
    endDate: '',
    halfDay: false,
    halfDaySession: 'Morning', // 'Morning' | 'Afternoon'
    reason: '',
  });

  const [balance, setBalance] = useState({
    paid: 12,
    sick: 10,
    unpaid: 0,
  });

  const [loading, setLoading] = useState(false);
  const [fetchingBalance, setFetchingBalance] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Fetch Leave Balance on Mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await leaveService.getMyLeaves();
        if (res.balance) {
          setBalance(res.balance);
        }
      } catch (err) {
        console.error('Error loading leave balance:', err);
      } finally {
        setFetchingBalance(false);
      }
    };
    fetchBalance();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { leaveType, startDate, endDate, halfDay, halfDaySession, reason } = formData;

    if (!startDate || !endDate) {
      setError('Please select both start date and end date.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End Date must be greater than or equal to Start Date.');
      return;
    }

    if (!reason || reason.trim().length < 10) {
      setError('Reason must be at least 10 characters long.');
      return;
    }

    if (halfDay && !halfDaySession) {
      setError('Please select a Half Day Session (Morning or Afternoon).');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        leaveType,
        startDate,
        endDate,
        halfDay,
        halfDaySession: halfDay ? halfDaySession : null,
        reason: reason.trim(),
      };

      const res = await leaveService.applyLeave(payload);
      setToast({ message: res.message || 'Leave request submitted successfully!', type: 'success' });
      
      setTimeout(() => {
        navigate('/leave/my-leaves');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Calendar className="w-8 h-8 text-indigo-400" />
          Apply for Leave
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Submit a leave request for management review and track your available balances.
        </p>
      </div>

      {/* Top Section — Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Paid Leave Balance */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Paid Leave Balance</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {fetchingBalance ? <Loader2 className="w-5 h-5 animate-spin inline" /> : `${balance.paid} days`}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Annual quota</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Sick Leave Balance */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Sick Leave Balance</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {fetchingBalance ? <Loader2 className="w-5 h-5 animate-spin inline" /> : `${balance.sick} days`}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Medical allowance</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <HeartPulse className="w-6 h-6" />
          </div>
        </div>

        {/* Unpaid Leave */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-900 border border-amber-500/30 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Unpaid Leave</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {fetchingBalance ? <Loader2 className="w-5 h-5 animate-spin inline" /> : `${balance.unpaid} days`}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Additional leave</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Leave Type Radio Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Leave Type <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { type: 'Paid', label: 'Paid Leave', color: 'indigo' },
                { type: 'Sick', label: 'Sick Leave', color: 'emerald' },
                { type: 'Unpaid', label: 'Unpaid Leave', color: 'amber' },
              ].map((item) => (
                <label
                  key={item.type}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    formData.leaveType === item.type
                      ? 'bg-indigo-600/15 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <span className="text-sm font-semibold">{item.label}</span>
                  <input
                    type="radio"
                    name="leaveType"
                    value={item.type}
                    checked={formData.leaveType === item.type}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 focus:ring-indigo-500"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* 2. Date Range Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Start Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                End Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleChange}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* 3. Half Day Toggle & Session Selection */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="halfDay"
                checked={formData.halfDay}
                onChange={handleChange}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-slate-200">Apply for Half Day Leave</span>
            </label>

            {formData.halfDay && (
              <div className="pt-2 border-t border-slate-800/80 space-y-2 animate-fade-in">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Session</p>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="halfDaySession"
                      value="Morning"
                      checked={formData.halfDaySession === 'Morning'}
                      onChange={handleChange}
                      className="text-indigo-600 bg-slate-800 border-slate-600"
                    />
                    <span>Morning Session</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="halfDaySession"
                      value="Afternoon"
                      checked={formData.halfDaySession === 'Afternoon'}
                      onChange={handleChange}
                      className="text-indigo-600 bg-slate-800 border-slate-600"
                    />
                    <span>Afternoon Session</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* 4. Reason Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Reason for Leave <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Min 10 characters</span>
            </div>
            <textarea
              name="reason"
              rows="4"
              required
              minLength={10}
              value={formData.reason}
              onChange={handleChange}
              placeholder="Provide detailed explanation for your leave request..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Leave Request</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;
