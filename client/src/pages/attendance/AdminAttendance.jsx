const React = require('react');
const { useState, useEffect, useMemo } = React;
const { 
  Users, 
  UserCheck, 
  UserX, 
  Calendar, 
  Clock, 
  Filter, 
  Search, 
  Edit3, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Save, 
  AlertTriangle,
  Building,
  Coffee
} = require('lucide-react');
const attendanceService = require('../../services/attendanceService').default;
const Toast = require('../../components/Toast').default;

const AdminAttendance = () => {
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [dateFilter, setDateFilter] = useState(getTodayStr());
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    checkIn: '',
    checkOut: '',
    status: 'Present',
    notes: '',
  });
  const [saveLoading, setSaveLoading] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

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

  // Fetch Attendance Records
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getAllAttendance({
        date: dateFilter || undefined,
        department: deptFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: 20,
      });

      let fetchedRecords = res.records || [];

      // Apply client-side search filter by name/code if query exists
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        fetchedRecords = fetchedRecords.filter(
          (r) =>
            (r.employeeName && r.employeeName.toLowerCase().includes(q)) ||
            (r.employeeCode && r.employeeCode.toLowerCase().includes(q)) ||
            (r.User && r.User.email && r.User.email.toLowerCase().includes(q))
        );
      }

      setRecords(fetchedRecords);
      setTotal(res.total || fetchedRecords.length);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Error fetching admin attendance:', err);
      showToast(err.response?.data?.message || 'Failed to load attendance records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter, deptFilter, statusFilter, page]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAttendance();
  };

  // Open Edit Modal
  const openEditModal = (rec) => {
    setEditingRecord(rec);
    setEditForm({
      checkIn: rec.checkIn || '',
      checkOut: rec.checkOut || '',
      status: rec.status || 'Present',
      notes: rec.notes || '',
    });
  };

  // Close Edit Modal
  const closeEditModal = () => {
    setEditingRecord(null);
  };

  // Save Edit Changes
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;

    setSaveLoading(true);
    try {
      const res = await attendanceService.updateAttendance(editingRecord.id, editForm);
      showToast(res.message || 'Attendance record updated successfully!', 'success');
      closeEditModal();
      await fetchAttendance();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update attendance record', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  // Compute Stats for Top Cards
  const stats = useMemo(() => {
    const totalEmployees = new Set(records.map((r) => r.userId)).size || records.length || 0;
    const presentToday = records.filter((r) => r.status === 'Present').length;
    const absentToday = records.filter((r) => r.status === 'Absent').length;
    const onLeaveToday = records.filter((r) => r.status === 'Leave').length;

    // Calculate Avg Check-In Time
    const checkInTimes = records
      .filter((r) => r.checkIn && r.status === 'Present')
      .map((r) => {
        const parts = r.checkIn.split(':').map(Number);
        return parts[0] * 60 + parts[1];
      });

    let avgTimeStr = '--:--';
    if (checkInTimes.length > 0) {
      const avgMins = Math.round(checkInTimes.reduce((a, b) => a + b, 0) / checkInTimes.length);
      const h = Math.floor(avgMins / 60);
      const m = avgMins % 60;
      avgTimeStr = formatTime12h(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
    }

    return {
      totalEmployees,
      presentToday,
      absentToday,
      onLeaveToday,
      avgCheckInTime: avgTimeStr,
    };
  }, [records]);

  // Render Status Badges
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

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Clock className="w-8 h-8 text-indigo-400" />
          Admin Attendance Overview
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor organisation-wide employee attendance, inspect logs, and modify records.
        </p>
      </div>

      {/* TOP STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Employees */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Records</p>
            <h4 className="text-2xl font-extrabold text-white mt-1">{total}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Present Today */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/20 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Present</p>
            <h4 className="text-2xl font-extrabold text-emerald-300 mt-1">{stats.presentToday}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Absent Today */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-rose-500/20 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Absent</p>
            <h4 className="text-2xl font-extrabold text-rose-300 mt-1">{stats.absentToday}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        {/* On Leave Today */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-sky-500/20 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider">On Leave</p>
            <h4 className="text-2xl font-extrabold text-sky-300 mt-1">{stats.onLeaveToday}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Avg Check-in Time */}
        <div className="col-span-2 lg:col-span-1 p-5 rounded-2xl bg-slate-900 border border-amber-500/20 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Avg Check-In</p>
            <h4 className="text-2xl font-extrabold text-amber-300 mt-1 font-mono">{stats.avgCheckInTime}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <form onSubmit={handleApplyFilters} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Department Select */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Department
            </label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          {/* Status Select */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Half-day">Half-day</option>
              <option value="Leave">Leave</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Search Employee
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Name or Emp ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </form>

      {/* DATA TABLE */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-slate-900 border border-slate-800/80 rounded-2xl">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Fetching attendance records...</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl space-y-4 p-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Employee ID</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Check-In</th>
                  <th className="py-4 px-6">Check-Out</th>
                  <th className="py-4 px-6">Hours</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Notes</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center py-16 text-slate-500">
                      <div className="flex flex-col items-center space-y-2">
                        <AlertTriangle className="w-8 h-8 text-slate-600" />
                        <p className="font-semibold text-slate-400">No attendance records found for this period</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 font-mono text-indigo-400 font-bold">
                        {rec.employeeCode || 'EMP---'}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-200">
                        {rec.employeeName || (rec.User ? rec.User.name : 'Unknown')}
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {rec.department || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-mono">
                        {rec.date}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-300">
                        {formatTime12h(rec.checkIn)}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-300">
                        {formatTime12h(rec.checkOut)}
                      </td>
                      <td className="py-4 px-6 font-bold text-indigo-300">
                        {rec.totalHours !== null && rec.totalHours !== undefined ? `${rec.totalHours} hrs` : '--'}
                      </td>
                      <td className="py-4 px-6">{renderStatusBadge(rec.status)}</td>
                      <td className="py-4 px-6 text-slate-400">{rec.location || 'Office'}</td>
                      <td className="py-4 px-6 text-slate-400 max-w-xs truncate">{rec.notes || '--'}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => openEditModal(rec)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 ml-auto transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
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
              Showing Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({total} total records)
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

      {/* EDIT ATTENDANCE MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                <span>Edit Attendance Record</span>
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 text-xs space-y-1">
              <p><strong className="text-slate-300">Employee:</strong> {editingRecord.employeeName || 'Unknown'} ({editingRecord.employeeCode || 'EMP'})</p>
              <p><strong className="text-slate-300">Date:</strong> {editingRecord.date}</p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Check-In Time */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Check-In Time
                </label>
                <input
                  type="time"
                  step="1"
                  value={editForm.checkIn}
                  onChange={(e) => setEditForm({ ...editForm, checkIn: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Check-Out Time */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Check-Out Time
                </label>
                <input
                  type="time"
                  step="1"
                  value={editForm.checkOut}
                  onChange={(e) => setEditForm({ ...editForm, checkOut: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Attendance Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Half-day">Half-day</option>
                  <option value="Leave">Leave</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Notes
                </label>
                <textarea
                  rows="3"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Reason for edit or notes..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saveLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;
