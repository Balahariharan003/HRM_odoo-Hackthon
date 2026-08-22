import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  LogOut, 
  Calendar as CalendarIcon, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  MapPin, 
  FileText,
  UserCheck,
  UserX,
  AlertTriangle,
  Coffee
} from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import Toast from '../../components/Toast';

const AttendanceView = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [summary, setSummary] = useState({
    totalDays: 0,
    present: 0,
    absent: 0,
    halfDay: 0,
    leave: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Daily'); // 'Daily' | 'Weekly' | 'Monthly'
  const [toast, setToast] = useState(null);

  // Today formatted as YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Attendance Data
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getMyAttendance({ view: activeTab.toLowerCase() });
      setAttendanceRecords(data.records || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      showToast(err.response?.data?.message || 'Failed to load attendance records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [activeTab]);

  // Find today's attendance record
  const todayRecord = useMemo(() => {
    return attendanceRecords.find((r) => r.date === todayStr);
  }, [attendanceRecords, todayStr]);

  // Determine current check-in/check-out state
  const isCheckedIn = Boolean(todayRecord && todayRecord.checkIn);
  const isCheckedOut = Boolean(todayRecord && todayRecord.checkOut);

  // Helper for 12hr time format
  const formatTime12h = (time24) => {
    if (!time24) return '--:--';
    const parts = time24.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // Check In Handler
  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const res = await attendanceService.checkIn({
        location: 'Office',
        notes: 'Web check-in',
      });
      showToast(res.message || 'Successfully checked in!', 'success');
      await fetchAttendance();
    } catch (err) {
      showToast(err.response?.data?.message || 'Check-in failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Check Out Handler
  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const res = await attendanceService.checkOut({
        notes: 'Web check-out',
      });
      showToast(res.message || 'Successfully checked out!', 'success');
      await fetchAttendance();
    } catch (err) {
      showToast(err.response?.data?.message || 'Check-out failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate Average Hours per Day
  const averageHoursPerDay = useMemo(() => {
    const presentRecords = attendanceRecords.filter(
      (r) => (r.status === 'Present' || r.status === 'Half-day') && r.totalHours > 0
    );
    if (presentRecords.length === 0) return '0.0';
    const totalHoursSum = presentRecords.reduce((acc, r) => acc + (parseFloat(r.totalHours) || 0), 0);
    return (totalHoursSum / presentRecords.length).toFixed(1);
  }, [attendanceRecords]);

  // Status Badge Component
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Present
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Absent
          </span>
        );
      case 'Half-day':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Half-day
          </span>
        );
      case 'Leave':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            Leave
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page Title & Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Clock className="w-8 h-8 text-indigo-400" />
            Attendance Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track daily check-ins, work hours, attendance history, and monthly trends.
          </p>
        </div>
      </div>

      {/* TOP SECTION — Today's Status Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800/90 to-slate-900 border border-slate-800/80 p-6 md:p-8 shadow-2xl shadow-slate-950/50">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          {/* Left info */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-slate-300">
              <CalendarIcon className="w-4 h-4 text-indigo-400" />
              <span>{todayFormatted}</span>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Today's Status</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">
                {!isCheckedIn && !isCheckedOut && (
                  <span className="text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 inline" /> Not Checked In
                  </span>
                )}
                {isCheckedIn && !isCheckedOut && (
                  <span className="text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 inline" /> Checked In at {formatTime12h(todayRecord.checkIn)}
                  </span>
                )}
                {isCheckedOut && (
                  <span className="text-sky-400 flex items-center gap-2">
                    <LogOut className="w-6 h-6 inline" /> Checked Out at {formatTime12h(todayRecord.checkOut)}
                  </span>
                )}
              </h2>
            </div>

            {isCheckedOut && todayRecord?.totalHours !== undefined && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
                <Clock className="w-4 h-4" />
                <span>Total Work Hours Today: <strong className="text-white">{todayRecord.totalHours} hrs</strong></span>
              </div>
            )}
          </div>

          {/* Right Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {!isCheckedIn && !isCheckedOut && (
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-lg shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Clock className="w-6 h-6" />
                )}
                <span>Check In Now</span>
              </button>
            )}

            {isCheckedIn && !isCheckedOut && (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-lg shadow-xl shadow-rose-600/30 hover:shadow-rose-600/50 transition-all transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <LogOut className="w-6 h-6" />
                )}
                <span>Check Out Now</span>
              </button>
            )}

            {isCheckedOut && (
              <button
                disabled
                className="px-8 py-4 rounded-2xl bg-slate-800 text-slate-500 font-semibold text-base border border-slate-700 cursor-not-allowed flex items-center justify-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Already Checked Out for Today</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION — View Toggle & Main Attendance Views */}
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
            {['Daily', 'Weekly', 'Monthly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab} View
              </button>
            ))}
          </div>

          <button
            onClick={fetchAttendance}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Loader2 className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* View Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Fetching attendance records...</p>
          </div>
        ) : (
          <>
            {/* DAILY VIEW — Table */}
            {activeTab === 'Daily' && (
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-800/50 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6">Check-In</th>
                        <th className="py-4 px-6">Check-Out</th>
                        <th className="py-4 px-6">Work Hours</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6">Location</th>
                        <th className="py-4 px-6">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {attendanceRecords.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-12 text-slate-500">
                            No attendance records found for this period.
                          </td>
                        </tr>
                      ) : (
                        attendanceRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-4 px-6 font-semibold text-slate-200">
                              {new Date(record.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-4 px-6 text-slate-300 font-mono">
                              {formatTime12h(record.checkIn)}
                            </td>
                            <td className="py-4 px-6 text-slate-300 font-mono">
                              {formatTime12h(record.checkOut)}
                            </td>
                            <td className="py-4 px-6 font-semibold text-indigo-400">
                              {record.totalHours !== null && record.totalHours !== undefined
                                ? `${record.totalHours} hrs`
                                : '--'}
                            </td>
                            <td className="py-4 px-6">{renderStatusBadge(record.status)}</td>
                            <td className="py-4 px-6 text-slate-400">
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                {record.location || 'Office'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-400 max-w-xs truncate">
                              {record.notes || '--'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* WEEKLY VIEW — Group by week */}
            {activeTab === 'Weekly' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attendanceRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        In: {formatTime12h(record.checkIn)} | Out: {formatTime12h(record.checkOut)}
                      </p>
                      {record.notes && <p className="text-xs text-slate-500 italic">{record.notes}</p>}
                    </div>

                    <div className="text-right space-y-1">
                      {renderStatusBadge(record.status)}
                      <p className="text-xs font-semibold text-indigo-400">
                        {record.totalHours ? `${record.totalHours} hrs` : '--'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MONTHLY VIEW — Calendar Grid */}
            {activeTab === 'Monthly' && (
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-300">Monthly Calendar Grid</h3>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Present
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Absent
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Half-day
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Leave
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                  {attendanceRecords.map((record) => {
                    const statusColorMap = {
                      Present: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
                      Absent: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
                      'Half-day': 'bg-amber-500/10 border-amber-500/30 text-amber-300',
                      Leave: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
                    };
                    const colorClass = statusColorMap[record.status] || 'bg-slate-800 border-slate-700 text-slate-400';

                    return (
                      <div
                        key={record.id}
                        className={`p-3.5 rounded-xl border ${colorClass} flex flex-col justify-between h-24 transition-transform hover:scale-105`}
                      >
                        <span className="text-xs font-bold">
                          {new Date(record.date).getDate()} {new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider">{record.status}</p>
                          <p className="text-[10px] opacity-75 font-mono">
                            {record.totalHours ? `${record.totalHours} hrs` : '--'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* BOTTOM SECTION — Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Present */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/20 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Present</p>
            <h4 className="text-2xl font-extrabold text-emerald-400 mt-1">{summary.present || 0} days</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Total Absent */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-500/20 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Absent</p>
            <h4 className="text-2xl font-extrabold text-rose-400 mt-1">{summary.absent || 0} days</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        {/* Total Half-day */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/20 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Half-day</p>
            <h4 className="text-2xl font-extrabold text-amber-400 mt-1">{summary.halfDay || 0} days</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Coffee className="w-5 h-5" />
          </div>
        </div>

        {/* Total Leave */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-950/40 to-slate-900 border border-sky-500/20 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Leave</p>
            <h4 className="text-2xl font-extrabold text-sky-400 mt-1">{summary.leave || 0} days</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Average Hours */}
        <div className="col-span-2 md:col-span-1 p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Hours/Day</p>
            <h4 className="text-2xl font-extrabold text-indigo-300 mt-1">{averageHoursPerDay} hrs</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceView;
