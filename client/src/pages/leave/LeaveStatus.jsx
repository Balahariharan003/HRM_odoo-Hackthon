import React, { useState, useEffect } from 'react';
import { 
  CalendarOff, 
  Trash2, 
  Loader2, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText,
  AlertTriangle
} from 'lucide-react';
import leaveService from '../../services/leaveService';
import Toast from '../../components/Toast';

const LeaveStatus = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(null); // stores leaveId being cancelled
  const [filterStatus, setFilterStatus] = useState('All'); // 'All' | 'Pending' | 'Approved' | 'Rejected'
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchMyLeaves = async () => {
    setLoading(true);
    try {
      const data = await leaveService.getMyLeaves({ status: filterStatus });
      setLeaves(data.leaves || data.records || []);
    } catch (err) {
      console.error('Error fetching my leaves:', err);
      showToast(err.response?.data?.message || 'Failed to load leave status', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, [filterStatus]);

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this pending leave request?')) {
      return;
    }

    setCancelLoading(leaveId);
    try {
      const res = await leaveService.cancelLeave(leaveId);
      showToast(res.message || 'Leave request cancelled successfully!', 'success');
      await fetchMyLeaves();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel leave request', 'error');
    } finally {
      setCancelLoading(null);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CalendarOff className="w-8 h-8 text-indigo-400" />
            My Leave Requests
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track the status of your submitted leave applications and manage pending requests.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <button
          onClick={fetchMyLeaves}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Loader2 className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Leave Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-slate-900 border border-slate-800/80 rounded-2xl">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading leave requests...</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Leave Type</th>
                  <th className="py-4 px-6">Start Date</th>
                  <th className="py-4 px-6">End Date</th>
                  <th className="py-4 px-6">Total Days</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Reason</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-16 text-slate-500">
                      <div className="flex flex-col items-center space-y-2">
                        <AlertTriangle className="w-8 h-8 text-slate-600" />
                        <p className="font-semibold text-slate-400">No leave requests found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-200">
                        {leave.leaveType} Leave
                        {leave.halfDay && (
                          <span className="block text-[10px] text-amber-400 font-normal mt-0.5">
                            Half Day ({leave.halfDaySession})
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-mono">
                        {new Date(leave.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-mono">
                        {new Date(leave.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6 font-bold text-indigo-400">
                        {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
                      </td>
                      <td className="py-4 px-6">{renderStatusBadge(leave.status)}</td>
                      <td className="py-4 px-6 text-slate-400 max-w-xs truncate" title={leave.reason}>
                        {leave.reason}
                        {leave.comments && (
                          <span className="block text-[10px] text-slate-500 italic mt-0.5">
                            Comment: {leave.comments}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {leave.status === 'Pending' ? (
                          <button
                            onClick={() => handleCancelLeave(leave.id)}
                            disabled={cancelLoading === leave.id}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 ml-auto transition-colors disabled:opacity-50"
                          >
                            {cancelLoading === leave.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            <span>Cancel</span>
                          </button>
                        ) : (
                          <span className="text-slate-600 text-xs italic">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveStatus;
