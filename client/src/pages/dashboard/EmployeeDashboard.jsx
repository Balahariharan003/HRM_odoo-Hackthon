import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle2, 
  LogOut, 
  Calendar, 
  FileSpreadsheet, 
  FileCheck2, 
  UserCheck, 
  Loader2, 
  ArrowRight, 
  Sparkles,
  Coffee,
  AlertCircle
} from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import leaveService from '../../services/leaveService';
import Toast from '../../components/Toast';

const EmployeeDashboard = ({ user }) => {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({ present: 0, absent: 0, halfDay: 0, leave: 0 });
  const [leaveBalance, setLeaveBalance] = useState({ paid: 12, sick: 10, unpaid: 0 });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [attData, leaveData] = await Promise.all([
        attendanceService.getMyAttendance({ view: 'monthly' }),
        leaveService.getMyLeaves(),
      ]);

      setAttendance(attData.records || []);
      if (attData.summary) setSummary(attData.summary);

      if (leaveData.balance) setLeaveBalance(leaveData.balance);
      setRecentLeaves(leaveData.leaves ? leaveData.leaves.slice(0, 3) : []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const todayRecord = useMemo(() => {
    return attendance.find((r) => r.date === todayStr);
  }, [attendance, todayStr]);

  const isCheckedIn = Boolean(todayRecord && todayRecord.checkIn);
  const isCheckedOut = Boolean(todayRecord && todayRecord.checkOut);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const res = await attendanceService.checkIn({ location: 'Office Desk' });
      showToast(res.message || 'Check-in successful!', 'success');
      await loadDashboardData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Check-in failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const res = await attendanceService.checkOut();
      showToast(res.message || 'Check-out successful!', 'success');
      await loadDashboardData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Check-out failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 border border-indigo-500/30 p-6 md:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dayflow HRMS Dashboard</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Welcome back, {user?.name || 'Employee'}! 👋
            </h1>
            <p className="text-xs md:text-sm text-slate-300">
              Here is your attendance summary and quick access to leave applications.
            </p>
          </div>

          <Link
            to="/attendance"
            className="px-6 py-3 rounded-2xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all flex items-center gap-2 shadow-lg shrink-0 self-start md:self-auto"
          >
            <span>View Full Attendance</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Action — Today's Attendance Widget */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Quick Check-In / Check-Out</p>
          <h3 className="text-xl md:text-2xl font-bold text-white">
            {!isCheckedIn && !isCheckedOut && (
              <span className="text-amber-400">Not Checked In Today</span>
            )}
            {isCheckedIn && !isCheckedOut && (
              <span className="text-emerald-400">Checked In at {todayRecord.checkIn}</span>
            )}
            {isCheckedOut && (
              <span className="text-sky-400">Checked Out at {todayRecord.checkOut} ({todayRecord.totalHours} hrs)</span>
            )}
          </h3>
          <p className="text-xs text-slate-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {!isCheckedIn && !isCheckedOut && (
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
              <span>Check In Now</span>
            </button>
          )}

          {isCheckedIn && !isCheckedOut && (
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              <span>Check Out Now</span>
            </button>
          )}

          {isCheckedOut && (
            <span className="px-6 py-3 rounded-2xl bg-slate-800 text-slate-400 font-semibold text-xs border border-slate-700 inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Completed for Today
            </span>
          )}
        </div>
      </div>

      {/* Grid: Stats & Leave Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attendance Summary */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Monthly Attendance</span>
            </h4>
            <Link to="/attendance" className="text-xs text-indigo-400 hover:underline">View All</Link>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-slate-400">Present</p>
              <p className="text-lg font-bold text-emerald-400 mt-1">{summary.present} days</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <p className="text-slate-400">Absent</p>
              <p className="text-lg font-bold text-rose-400 mt-1">{summary.absent} days</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-slate-400">Half-day</p>
              <p className="text-lg font-bold text-amber-400 mt-1">{summary.halfDay} days</p>
            </div>
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
              <p className="text-slate-400">Leave</p>
              <p className="text-lg font-bold text-sky-400 mt-1">{summary.leave} days</p>
            </div>
          </div>
        </div>

        {/* Leave Balances */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Leave Balances</span>
            </h4>
            <Link to="/leave/apply" className="text-xs text-indigo-400 hover:underline">Apply</Link>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="font-semibold text-slate-300">Paid Leave</span>
              <span className="font-bold text-indigo-400">{leaveBalance.paid} days</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="font-semibold text-slate-300">Sick Leave</span>
              <span className="font-bold text-emerald-400">{leaveBalance.sick} days</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="font-semibold text-slate-300">Unpaid Leave</span>
              <span className="font-bold text-amber-400">{leaveBalance.unpaid} days</span>
            </div>
          </div>
        </div>

        {/* Quick Links / Actions */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Quick Services</span>
          </h4>

          <div className="space-y-3">
            <Link
              to="/leave/apply"
              className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 transition-colors text-xs font-semibold"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                <span>Apply for Leave</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/leave/my-leaves"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/60 border border-slate-700/60 text-slate-200 transition-colors text-xs font-semibold"
            >
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-4 h-4 text-slate-400" />
                <span>View My Leave Status</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {(user?.role === 'Admin' || user?.role === 'HR_Officer') && (
              <Link
                to="/admin/attendance"
                className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-colors text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <span>Admin Attendance Portal</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
