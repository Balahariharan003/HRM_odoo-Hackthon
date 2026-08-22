import React, { useState, useEffect } from 'react';
import {
  getDashboardAnalytics,
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport
} from '../../services/reportService';
import { Users, Clock, Calendar, DollarSign, Download, Filter, BarChart3, PieChart, TrendingUp, RefreshCw, Inbox } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = [2024, 2025, 2026];
const DEPARTMENTS = ['All', 'Engineering', 'HR', 'Management', 'Sales', 'Finance'];

export default function ReportsDashboard({ showToast }) {
  const currentDate = new Date();
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'leave' | 'payroll'

  // Top Dashboard Analytics Stats
  const [analytics, setAnalytics] = useState(null);

  // Tab 1: Attendance Report state
  const [attStartDate, setAttStartDate] = useState('');
  const [attEndDate, setAttEndDate] = useState('');
  const [attDept, setAttDept] = useState('All');
  const [attReportData, setAttReportData] = useState(null);
  const [loadingAtt, setLoadingAtt] = useState(false);

  // Tab 2: Leave Report state
  const [leaveYear, setLeaveYear] = useState(currentDate.getFullYear());
  const [leaveDept, setLeaveDept] = useState('All');
  const [leaveReportData, setLeaveReportData] = useState(null);
  const [loadingLeave, setLoadingLeave] = useState(false);

  // Tab 3: Payroll Report state
  const [payMonth, setPayMonth] = useState(currentDate.getMonth() + 1);
  const [payYear, setPayYear] = useState(currentDate.getFullYear());
  const [payReportData, setPayReportData] = useState(null);
  const [loadingPay, setLoadingPay] = useState(false);

  // Fetch top dashboard cards
  const fetchAnalytics = async () => {
    try {
      const data = await getDashboardAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  // Fetch Attendance Report
  const fetchAttendance = async () => {
    setLoadingAtt(true);
    try {
      const params = {};
      if (attStartDate) params.startDate = attStartDate;
      if (attEndDate) params.endDate = attEndDate;
      if (attDept !== 'All') params.department = attDept;

      const data = await getAttendanceReport(params);
      setAttReportData(data);
      if (showToast) showToast('Attendance report generated successfully');
    } catch (err) {
      console.error('Error fetching attendance report:', err);
    } finally {
      setLoadingAtt(false);
    }
  };

  // Fetch Leave Report
  const fetchLeave = async () => {
    setLoadingLeave(true);
    try {
      const params = { year: leaveYear };
      if (leaveDept !== 'All') params.department = leaveDept;

      const data = await getLeaveReport(params);
      setLeaveReportData(data);
      if (showToast) showToast('Leave report generated successfully');
    } catch (err) {
      console.error('Error fetching leave report:', err);
    } finally {
      setLoadingLeave(false);
    }
  };

  // Fetch Payroll Report
  const fetchPayroll = async () => {
    setLoadingPay(true);
    try {
      const params = { month: payMonth, year: payYear };
      const data = await getPayrollReport(params);
      setPayReportData(data);
      if (showToast) showToast('Payroll report generated successfully');
    } catch (err) {
      console.error('Error fetching payroll report:', err);
    } finally {
      setLoadingPay(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchAttendance();
    fetchLeave();
    fetchPayroll();
  }, []);

  // CSV Export helper
  const handleExportCSV = async (type) => {
    try {
      let params = { format: 'csv' };
      let filename = 'report.csv';

      if (type === 'attendance') {
        if (attStartDate) params.startDate = attStartDate;
        if (attEndDate) params.endDate = attEndDate;
        if (attDept !== 'All') params.department = attDept;
        filename = 'attendance_report.csv';
      } else if (type === 'leave') {
        params.year = leaveYear;
        if (leaveDept !== 'All') params.department = leaveDept;
        filename = 'leave_report.csv';
      } else if (type === 'payroll') {
        params.month = payMonth;
        params.year = payYear;
        filename = 'payroll_report.csv';
      }

      let data;
      if (type === 'attendance') data = await getAttendanceReport(params);
      if (type === 'leave') data = await getLeaveReport(params);
      if (type === 'payroll') data = await getPayrollReport(params);

      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      if (showToast) showToast(`Exported ${type} report to CSV`);
    } catch (err) {
      console.error('Export CSV error:', err);
      alert('Failed to export CSV report.');
    }
  };

  const formatCurrency = (val) => `₹${parseFloat(val || 0).toLocaleString('en-IN')}`;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Reports & Executive Analytics</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.95rem' }}>Comprehensive breakdown of workforce attendance, leave utilization, and payroll expense</p>
        </div>

        <button
          onClick={() => {
            fetchAnalytics();
            if (activeTab === 'attendance') fetchAttendance();
            if (activeTab === 'leave') fetchLeave();
            if (activeTab === 'payroll') fetchPayroll();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#475569',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={16} /> Refresh Metrics
        </button>
      </div>

      {/* Top Stats Cards (4 Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Card 1: Total Employees */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Employees</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {analytics ? analytics.employees.total : '...'}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
              +{analytics ? analytics.employees.newThisMonth : 0} new this month
            </span>
          </div>
        </div>

        {/* Card 2: Today's Attendance */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Today's Attendance</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {analytics ? `${analytics.attendance.todayPresent} Present` : '...'}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {analytics ? `${analytics.attendance.todayAbsent} absent, ${analytics.attendance.todayOnLeave} leave` : ''}
            </span>
          </div>
        </div>

        {/* Card 3: Pending Leave Requests */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Pending Leave Requests</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {analytics ? analytics.leave.pendingRequests : '...'}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
              {analytics ? `${analytics.leave.approvedThisMonth} approved this month` : ''}
            </span>
          </div>
        </div>

        {/* Card 4: Monthly Payout */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Monthly Payout</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {analytics ? formatCurrency(analytics.payroll.totalMonthlyPayout) : '...'}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Last: {analytics?.payroll?.lastProcessed || 'N/A'}
            </span>
          </div>
        </div>

      </div>

      {/* Tabs Navigation Header */}
      <div style={{ borderBottom: '2px solid #e2e8f0', marginBottom: '24px', display: 'flex', gap: '32px' }}>
        <button
          onClick={() => setActiveTab('attendance')}
          style={{
            padding: '12px 4px',
            border: 'none',
            background: 'transparent',
            fontSize: '1rem',
            fontWeight: 700,
            color: activeTab === 'attendance' ? '#2563eb' : '#64748b',
            borderBottom: activeTab === 'attendance' ? '3px solid #2563eb' : '3px solid transparent',
            marginBottom: '-2px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Clock size={18} /> Attendance Report
        </button>

        <button
          onClick={() => setActiveTab('leave')}
          style={{
            padding: '12px 4px',
            border: 'none',
            background: 'transparent',
            fontSize: '1rem',
            fontWeight: 700,
            color: activeTab === 'leave' ? '#2563eb' : '#64748b',
            borderBottom: activeTab === 'leave' ? '3px solid #2563eb' : '3px solid transparent',
            marginBottom: '-2px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Calendar size={18} /> Leave Report
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          style={{
            padding: '12px 4px',
            border: 'none',
            background: 'transparent',
            fontSize: '1rem',
            fontWeight: 700,
            color: activeTab === 'payroll' ? '#2563eb' : '#64748b',
            borderBottom: activeTab === 'payroll' ? '3px solid #2563eb' : '3px solid transparent',
            marginBottom: '-2px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <DollarSign size={18} /> Payroll Report
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ATTENDANCE REPORT */}
      {/* ============================================================== */}
      {activeTab === 'attendance' && (
        <div>
          {/* Controls Bar */}
          <div style={{ background: '#ffffff', padding: '18px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Start Date</label>
                <input
                  type="date"
                  value={attStartDate}
                  onChange={(e) => setAttStartDate(e.target.value)}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>End Date</label>
                <input
                  type="date"
                  value={attEndDate}
                  onChange={(e) => setAttEndDate(e.target.value)}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Department</label>
                <select
                  value={attDept}
                  onChange={(e) => setAttDept(e.target.value)}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', fontSize: '0.9rem' }}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={fetchAttendance}
                style={{ marginTop: '18px', padding: '8px 16px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Generate Report
              </button>
            </div>

            <button
              onClick={() => handleExportCSV('attendance')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#ffffff', color: '#16a34a', border: '1px solid #16a34a', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
            >
              <Download size={16} /> Export CSV
            </button>
          </div>

          {/* Results Summary */}
          {loadingAtt ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Generating attendance metrics...</div>
          ) : !attReportData || attReportData.totalRecords === 0 ? (
            /* Empty State */
            <div style={{ padding: '48px 24px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <Inbox size={40} color="#94a3b8" style={{ marginBottom: '8px' }} />
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#1e293b' }}>No Attendance Records Found</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Try broadening your date range or department filter selection.</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Avg Attendance</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb' }}>{attReportData.avgAttendance}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Present</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>{attReportData.totalPresent}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Absent</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>{attReportData.totalAbsent}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Half-Day</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706' }}>{attReportData.totalHalfDay}</div>
                </div>
              </div>

              {/* Attendance Table */}
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '12px 16px' }}>Department</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Records</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Present</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Absent</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Half-Day</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Leave</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attReportData.breakdown && attReportData.breakdown.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{row.department}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>{row.totalRecords}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>{row.present}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#dc2626' }}>{row.absent}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#d97706' }}>{row.halfDay}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>{row.leave}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: LEAVE REPORT */}
      {/* ============================================================== */}
      {activeTab === 'leave' && (
        <div>
          {/* Controls Bar */}
          <div style={{ background: '#ffffff', padding: '18px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Year</label>
                <select
                  value={leaveYear}
                  onChange={(e) => setLeaveYear(Number(e.target.value))}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', fontSize: '0.9rem' }}
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Department</label>
                <select
                  value={leaveDept}
                  onChange={(e) => setLeaveDept(e.target.value)}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', fontSize: '0.9rem' }}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={fetchLeave}
                style={{ marginTop: '18px', padding: '8px 16px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Filter Report
              </button>
            </div>

            <button
              onClick={() => handleExportCSV('leave')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#ffffff', color: '#16a34a', border: '1px solid #16a34a', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
            >
              <Download size={16} /> Export CSV
            </button>
          </div>

          {/* Leave Summary Cards */}
          {loadingLeave ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading leave report data...</div>
          ) : !leaveReportData || leaveReportData.totalRequests === 0 ? (
            /* Empty State */
            <div style={{ padding: '48px 24px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <Inbox size={40} color="#94a3b8" style={{ marginBottom: '8px' }} />
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#1e293b' }}>No Leave Requests Found</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>No leave applications registered for {leaveYear} in {leaveDept}.</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Requests</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{leaveReportData.totalRequests}</div>
                </div>
                <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>Approved</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }}>{leaveReportData.approved}</div>
                </div>
                <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '10px', border: '1px solid #fecaca' }}>
                  <span style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 600 }}>Rejected</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b91c1c' }}>{leaveReportData.rejected}</div>
                </div>
                <div style={{ background: '#fef9c3', padding: '16px', borderRadius: '10px', border: '1px solid #fef08a' }}>
                  <span style={{ fontSize: '0.8rem', color: '#854d0e', fontWeight: 600 }}>Pending</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a16207' }}>{leaveReportData.pending}</div>
                </div>
              </div>

              {/* By Type Chart & Breakdown */}
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Leave Types Breakdown</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                  {Object.entries(leaveReportData.byType || {}).map(([type, count]) => (
                    <div key={type} style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ textTransform: 'capitalize', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{type} Leave</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: PAYROLL REPORT */}
      {/* ============================================================== */}
      {activeTab === 'payroll' && (
        <div>
          {/* Controls Bar */}
          <div style={{ background: '#ffffff', padding: '18px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Month</label>
                <select
                  value={payMonth}
                  onChange={(e) => setPayMonth(Number(e.target.value))}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', fontSize: '0.9rem' }}
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={idx + 1} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Year</label>
                <select
                  value={payYear}
                  onChange={(e) => setPayYear(Number(e.target.value))}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', fontSize: '0.9rem' }}
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={fetchPayroll}
                style={{ marginTop: '18px', padding: '8px 16px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Fetch Payroll Report
              </button>
            </div>

            <button
              onClick={() => handleExportCSV('payroll')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#ffffff', color: '#16a34a', border: '1px solid #16a34a', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
            >
              <Download size={16} /> Export CSV
            </button>
          </div>

          {/* Summary Cards */}
          {loadingPay ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading payroll report data...</div>
          ) : !payReportData || payReportData.totalEmployees === 0 ? (
            /* Empty State */
            <div style={{ padding: '48px 24px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <Inbox size={40} color="#94a3b8" style={{ marginBottom: '8px' }} />
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#1e293b' }}>No Payroll Data Available</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>No payroll processing records found for {MONTH_NAMES[payMonth - 1]} {payYear}.</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Employees</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{payReportData.totalEmployees}</div>
                </div>

                <div style={{ background: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  <span style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: 600 }}>Total Gross Salary</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1d4ed8', marginTop: '2px' }}>{formatCurrency(payReportData.totalGross)}</div>
                </div>

                <div style={{ background: '#fef2f2', padding: '18px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <span style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 600 }}>Total Deductions</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>{formatCurrency(payReportData.totalDeductions)}</div>
                </div>

                <div style={{ background: '#f0fdf4', padding: '18px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>Total Net Payout</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>{formatCurrency(payReportData.totalNet)}</div>
                </div>
              </div>

              {/* Department Breakdown Table */}
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Department Payroll Breakdown</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '12px 16px' }}>Department</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Employees</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Gross Salary</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', color: '#dc2626' }}>Total Deductions</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', color: '#15803d', fontWeight: 800 }}>Net Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payReportData.breakdown && payReportData.breakdown.map((b, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{b.department}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>{b.totalEmployees}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>{formatCurrency(b.gross)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#dc2626' }}>{formatCurrency(b.deductions)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#15803d' }}>{formatCurrency(b.net)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
