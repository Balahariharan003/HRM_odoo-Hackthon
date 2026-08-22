import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  Loader2, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare,
  Building,
  AlertCircle,
  X
} from 'lucide-react';
import leaveService from '../../services/leaveService';
import Toast from '../../components/Toast';

const LeaveApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [deptFilter, setDeptFilter] = useState('');

  // Modal State for Approve/Reject action
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'Approved' | 'Rejected'
  const [comment, setComment] = useState('');
  const [modalError, setModalError] = useState('');

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const res = await leaveService.getAllLeaveRequests({
        status: statusFilter,
        department: deptFilter || undefined,
        page,
        limit: 10,
      });
      setRequests(res.records || []);
      setTotalPages(res.totalPages || 1);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      showToast(err.response?.data?.message || 'Failed to load leave requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [statusFilter, deptFilter, page]);

  const openActionModal = (leave, action) => {
    setSelectedLeave(leave);
    setModalAction(action);
    setComment('');
    setModalError('');
  };

  const closeModal = () => {
    setSelectedLeave(null);
    setModalAction(null);
    setComment('');
    setModalError('');
  };

  const handleProcessLeave = async () => {
    if (!selectedLeave || !modalAction) return;

    if (modalAction === 'Rejected' && (!comment || comment.trim().length === 0)) {
      setModalError('Rejection comment is required.');
      return;
    }

    setActionLoading(true);
    setModalError('');

    try {
      const res = await leaveService.approveLeave(selectedLeave.id, {
        action: modalAction,
        comments: comment.trim() || undefined,
      });

      showToast(
        res.message || `Leave request ${modalAction.toLowerCase()} successfully!`,
        'success'
      );
      closeModal();
      await fetchLeaveRequests();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to process leave request.');
    } finally {
      setActionLoading(false);
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
            <UserCheck className="w-8 h-8 text-indigo-400" />
            Leave Approvals & Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review, approve, or reject employee leave applications across departments.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="All">All Statuses</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchLeaveRequests}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors self-end sm:self-auto"
        >
          <Loader2 className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-slate-900 border border-slate-800/80 rounded-2xl">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Fetching employee leave requests...</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl space-y-4 p-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Emp ID</th>
                  <th className="py-4 px-6">Employee Name</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Leave Type</th>
                  <th className="py-4 px-6">Dates</th>
                  <th className="py-4 px-6">Days</th>
                  <th className="py-4 px-6">Reason</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-16 text-slate-500">
                      No leave requests match the selected filters.
                    </td>
                  </tr>
                ) : (
                  requests.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 font-mono text-indigo-400 font-bold">
                        {leave.employeeCode || 'EMP---'}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-200">
                        {leave.employeeName || 'Unknown Employee'}
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {leave.department || 'N/A'}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-300">
                        {leave.leaveType}
                        {leave.halfDay && (
                          <span className="block text-[10px] text-amber-400 font-normal">
                            Half Day ({leave.halfDaySession})
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-mono text-[11px]">
                        {leave.startDate} → {leave.endDate}
                      </td>
                      <td className="py-4 px-6 font-bold text-indigo-300">
                        {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
                      </td>
                      <td className="py-4 px-6 text-slate-400 max-w-xs truncate" title={leave.reason}>
                        {leave.reason}
                        {leave.comments && (
                          <span className="block text-[10px] text-slate-500 italic mt-0.5">
                            HR Comment: {leave.comments}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">{renderStatusBadge(leave.status)}</td>
                      <td className="py-4 px-6 text-center">
                        {leave.status === 'Pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openActionModal(leave, 'Approved')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => openActionModal(leave, 'Rejected')}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs italic">
                            Processed {leave.approverName ? `by ${leave.approverName}` : ''}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({total} total requests)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE / REJECT MODAL */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {modalAction === 'Approved' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <span>{modalAction} Leave Request</span>
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs space-y-1.5">
              <p><strong className="text-slate-300">Employee:</strong> {selectedLeave.employeeName} ({selectedLeave.employeeCode})</p>
              <p><strong className="text-slate-300">Department:</strong> {selectedLeave.department}</p>
              <p><strong className="text-slate-300">Dates:</strong> {selectedLeave.startDate} to {selectedLeave.endDate} ({selectedLeave.totalDays} days)</p>
              <p><strong className="text-slate-300">Reason:</strong> {selectedLeave.reason}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Manager Comment {modalAction === 'Rejected' ? <span className="text-rose-400">* Required</span> : '(Optional)'}</span>
              </label>
              <textarea
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={modalAction === 'Rejected' ? 'Provide reason for rejection...' : 'Add an optional note...'}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessLeave}
                disabled={actionLoading}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 ${
                  modalAction === 'Approved'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                }`}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Confirm {modalAction}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApproval;
