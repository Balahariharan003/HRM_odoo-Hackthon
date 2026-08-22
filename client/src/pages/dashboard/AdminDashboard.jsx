import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';
import {
  Users,
  CalendarDays,
  Clock,
  UserPlus,
  RefreshCw,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  CheckCircle2,
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'attendance' | 'leave'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      const res = await userService.getAllUsers();
      if (res.success && Array.isArray(res.users)) {
        setUsers(res.users);
      }
    } catch (err) {
      toast.error('Failed to load users list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Format date: e.g. "Saturday, August 22, 2026"
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate Stats
  const totalEmployees = users.filter((u) => u.role === 'Employee').length || users.length;
  const pendingLeavesMock = 5;
  const todayAttendanceMock = '85%';

  // Filtered Users list based on search
  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    const empId = user.employeeId?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    const firstName = user.profile?.firstName?.toLowerCase() || '';
    const lastName = user.profile?.lastName?.toLowerCase() || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return (
      empId.includes(q) ||
      email.includes(q) ||
      firstName.includes(q) ||
      lastName.includes(q) ||
      fullName.includes(q)
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrative Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">{formattedDate}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchUsers}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold border border-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Top Row: 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Employees */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
              Live Count
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Employees</p>
          <h3 className="text-3xl font-extrabold text-white mt-1">{loading ? '...' : totalEmployees}</h3>
          <p className="text-xs text-slate-500 mt-2">Active registered personnel</p>
        </div>

        {/* Card 2: Pending Leaves */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CalendarDays className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              Coming from Module 2
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending Leaves</p>
          <h3 className="text-3xl font-extrabold text-white mt-1">{pendingLeavesMock}</h3>
          <p className="text-xs text-slate-500 mt-2">Awaiting HR approval</p>
        </div>

        {/* Card 3: Today's Attendance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              Coming from Module 2
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Today's Attendance</p>
          <h3 className="text-3xl font-extrabold text-white mt-1">{todayAttendanceMock}</h3>
          <p className="text-xs text-slate-500 mt-2">Checked-in status rate</p>
        </div>

        {/* Card 4: Quick Action - Add Employee */}
        <div className="bg-gradient-to-br from-indigo-900/40 via-slate-900 to-purple-900/30 border border-indigo-500/30 rounded-2xl p-6 shadow-md hover:border-indigo-500/60 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <UserPlus className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Quick Action</h4>
            </div>
            <p className="text-xs text-slate-400">Onboard a new team member directly into HRMS.</p>
          </div>
          <div className="pt-4">
            <Link
              to="/signup"
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Employee</span>
            </Link>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4 gap-4">
          <div className="flex space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Overview ({users.length})</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'attendance'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Attendance Records</span>
            </button>
            <button
              onClick={() => setActiveTab('leave')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'leave'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Leave Approvals</span>
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search name or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Overview - Employee List Table */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Employee ID</th>
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Designation</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-slate-400 text-sm">
                        Loading employee directory...
                      </td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-slate-400 text-sm">
                        No employees found matching "{searchQuery}".
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => {
                      const fullName = u.profile?.firstName || u.profile?.lastName
                        ? `${u.profile?.firstName || ''} ${u.profile?.lastName || ''}`.trim()
                        : 'Unspecified';

                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-800/50 transition-colors group"
                        >
                          <td className="px-5 py-4 font-mono text-xs text-purple-400 font-semibold">
                            {u.employeeId}
                          </td>
                          <td className="px-5 py-4 font-medium text-white">
                            {fullName}
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-300">
                            {u.email}
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-400">
                            {u.profile?.department || 'General'}
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-400">
                            {u.profile?.designation || 'Staff'}
                          </td>
                          <td className="px-5 py-4 text-xs">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                u.role === 'Admin'
                                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                  : u.role === 'HR_Officer'
                                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => navigate(`/profile/${u.id}`)}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 text-xs font-semibold transition-all border border-slate-700"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Profile</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!loading && filteredUsers.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4 text-xs text-slate-400">
                <p>
                  Showing <span className="font-bold text-white">{startIndex + 1}</span> to{' '}
                  <span className="font-bold text-white">
                    {Math.min(startIndex + itemsPerPage, filteredUsers.length)}
                  </span>{' '}
                  of <span className="font-bold text-white">{filteredUsers.length}</span> employees
                </p>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-lg font-semibold transition-all ${
                        currentPage === page
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Attendance Records Placeholder */}
        {activeTab === 'attendance' && (
          <div className="text-center py-16 px-4 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-3">
            <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center text-purple-400 mx-auto">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Attendance Records</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              Comprehensive attendance monitoring, daily check-in logs, and shift tracking will be implemented in Module 2.
            </p>
            <span className="inline-block px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-semibold rounded-full border border-purple-500/20">
              Coming in Module 2
            </span>
          </div>
        )}

        {/* Tab 3: Leave Approvals Placeholder */}
        {activeTab === 'leave' && (
          <div className="text-center py-16 px-4 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-3">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-400 mx-auto">
              <CalendarDays className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Leave Approvals</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              Employee leave request management and HR approval workflow will be integrated in Module 2.
            </p>
            <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">
              Coming in Module 2
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
