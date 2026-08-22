import React, { useState, useEffect } from 'react';
import { getAllPayroll, processMonthlyPayroll, updateSalaryStructure } from '../../services/payrollService';
import { Search, Play, Edit, Calendar, CheckCircle2, AlertCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = [2024, 2025, 2026];

export default function PayrollAdmin({ showToast }) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [searchQuery, setSearchQuery] = useState('');

  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Process Modal state
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState(null);

  // Edit Salary Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [savingSalary, setSavingSalary] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    basic: 0,
    hra: 0,
    allowances: 0,
    tax: 0,
    pf: 0,
    insurance: 0,
    other: 0,
  });

  const fetchPayrolls = async (page = currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPayroll({
        month: selectedMonth,
        year: selectedYear,
        page,
        limit: 20,
      });

      setPayrolls(data.payrolls || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      console.error('Error fetching payroll list:', err);
      setError('Failed to load payroll list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchPayrolls(1);
  }, [selectedMonth, selectedYear]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchPayrolls(newPage);
    }
  };

  // Process Payroll Action
  const handleProcessPayroll = async () => {
    setProcessing(true);
    setProcessResult(null);
    try {
      const res = await processMonthlyPayroll(selectedMonth, selectedYear);
      const monthName = MONTH_NAMES[selectedMonth - 1];
      const msg = `Payroll for ${monthName} ${selectedYear} processed successfully`;
      
      setProcessResult({
        type: 'success',
        message: `Successfully processed ${res.totalProcessed} active employee payrolls! Total payout: ₹${res.totalPayout.toLocaleString('en-IN')}`,
      });

      if (showToast) showToast(msg);
      fetchPayrolls(currentPage);
    } catch (err) {
      console.error('Error processing payroll:', err);
      setProcessResult({
        type: 'error',
        message: err.response?.data?.message || 'Failed to process monthly payroll.',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (p) => {
    setEditingEmployee(p);
    const basic = parseFloat(p.basic || 0);
    const hra = parseFloat(p.hra || 0);
    const allowances = parseFloat(p.allowances || 0);
    const tax = parseFloat(p.tax || 0);
    const pf = parseFloat(p.pf || 0);
    const insurance = parseFloat(p.insurance || 0);
    const other = parseFloat(p.otherDeductions || 0);

    setSalaryForm({
      basic,
      hra,
      allowances,
      tax,
      pf,
      insurance,
      other,
    });
    setShowEditModal(true);
  };

  // Save Salary Structure
  const handleSaveSalary = async (e) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setSavingSalary(true);
    try {
      const empId = editingEmployee.employeeId || editingEmployee.userId;
      await updateSalaryStructure(empId, {
        basic: salaryForm.basic,
        hra: salaryForm.hra,
        allowances: salaryForm.allowances,
        deductions: {
          tax: salaryForm.tax,
          pf: salaryForm.pf,
          insurance: salaryForm.insurance,
          other: salaryForm.other,
        },
        effectiveDate: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`,
      });

      if (showToast) {
        showToast(`Salary structure updated for ${editingEmployee.employeeId || 'employee'}`);
      }

      setShowEditModal(false);
      fetchPayrolls(currentPage);
    } catch (err) {
      console.error('Save salary error:', err);
      alert('Failed to update salary structure');
    } finally {
      setSavingSalary(false);
    }
  };

  // Dynamic salary calculations
  const calcGross = parseFloat(salaryForm.basic || 0) + parseFloat(salaryForm.hra || 0) + parseFloat(salaryForm.allowances || 0);
  const calcDeductions = parseFloat(salaryForm.tax || 0) + parseFloat(salaryForm.pf || 0) + parseFloat(salaryForm.insurance || 0) + parseFloat(salaryForm.other || 0);
  const calcNet = calcGross - calcDeductions;

  // Filtered payrolls by search query
  const filteredPayrolls = payrolls.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = (p.employeeName || '').toLowerCase();
    const empId = (p.employeeId || '').toLowerCase();
    const dept = (p.department || '').toLowerCase();
    return name.includes(q) || empId.includes(q) || dept.includes(q);
  });

  const formatCurrency = (val) => `₹${parseFloat(val || 0).toLocaleString('en-IN')}`;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Top Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Payroll Control Center</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.95rem' }}>Manage employee salary structures and run monthly batch processing</p>
        </div>

        {/* Top Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Month/Year selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Calendar size={18} color="#64748b" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={{ border: 'none', background: 'transparent', fontWeight: 600, color: '#1e293b', outline: 'none', cursor: 'pointer' }}
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{ border: 'none', background: 'transparent', fontWeight: 600, color: '#1e293b', outline: 'none', cursor: 'pointer' }}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Process Payroll button */}
          <button
            onClick={() => {
              setProcessResult(null);
              setShowProcessModal(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(22,163,74,0.2)',
              transition: 'background 0.2s',
            }}
          >
            <Play size={18} fill="#ffffff" />
            Process Payroll
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by Employee Name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
          Showing {filteredPayrolls.length} of {totalItems} entries
        </div>
      </div>

      {/* Payroll Table Container */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          /* Loading Skeletons */
          <div style={{ padding: '24px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ height: '44px', background: '#f1f5f9', borderRadius: '8px', marginBottom: '12px', animation: 'pulse 1.5s infinite ease-in-out' }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#dc2626' }}>{error}</div>
        ) : filteredPayrolls.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            No payroll records found matching your selection.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '14px 16px' }}>Emp ID</th>
                  <th style={{ padding: '14px 16px' }}>Name</th>
                  <th style={{ padding: '14px 16px' }}>Department</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Basic</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>HRA</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Allowances</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800 }}>Gross</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Tax</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>PF</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Insurance</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Other</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right', color: '#dc2626' }}>Deductions</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>Net Salary</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayrolls.map((p) => {
                  const status = p.paymentStatus || 'Pending';
                  let statusBg = '#fef9c3';
                  let statusColor = '#a16207';
                  if (status === 'Processed') { statusBg = '#dcfce7'; statusColor = '#15803d'; }
                  if (status === 'Failed') { statusBg = '#fee2e2'; statusColor = '#b91c1c'; }

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>{p.employeeId}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>{p.employeeName}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{p.department}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>{formatCurrency(p.basic)}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>{formatCurrency(p.hra)}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>{formatCurrency(p.allowances)}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{formatCurrency(p.grossSalary)}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>{formatCurrency(p.tax)}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>{formatCurrency(p.pf)}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>{formatCurrency(p.insurance)}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>{formatCurrency(p.otherDeductions)}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', color: '#dc2626' }}>{formatCurrency(p.totalDeductions)}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>{formatCurrency(p.netSalary)}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: statusBg, color: statusColor }}>
                          {status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          style={{
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            color: '#2563eb',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Edit size={14} /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Page {currentPage} of {totalPages}
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: currentPage === 1 ? '#cbd5e1' : '#334155',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={16} /> Prev
            </button>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: currentPage === totalPages ? '#cbd5e1' : '#334155',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Process Monthly Payroll Confirmation Modal */}
      {showProcessModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Confirm Payroll Batch Run</h3>
              <button onClick={() => setShowProcessModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              Are you sure you want to run monthly payroll batch processing for <strong>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</strong>?
              This will compute salaries and issue notifications for all active employees.
            </p>

            {processResult && (
              <div style={{ padding: '14px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', background: processResult.type === 'success' ? '#f0fdf4' : '#fef2f2', border: processResult.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca', color: processResult.type === 'success' ? '#166534' : '#991b1b' }}>
                {processResult.message}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowProcessModal(false)}
                style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPayroll}
                disabled={processing}
                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#ffffff', fontWeight: 600, cursor: processing ? 'wait' : 'pointer' }}
              >
                {processing ? 'Processing...' : 'Run Process Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Salary Structure Modal */}
      {showEditModal && editingEmployee && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '600px', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', pb: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Edit Salary Structure</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {editingEmployee.employeeName} ({editingEmployee.employeeId})
                </span>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSaveSalary}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Earnings Breakdown</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', mb: '4px' }}>Basic (₹)</label>
                  <input
                    type="number"
                    value={salaryForm.basic}
                    onChange={(e) => setSalaryForm({ ...salaryForm, basic: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', mb: '4px' }}>HRA (₹)</label>
                  <input
                    type="number"
                    value={salaryForm.hra}
                    onChange={(e) => setSalaryForm({ ...salaryForm, hra: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', mb: '4px' }}>Allowances (₹)</label>
                  <input
                    type="number"
                    value={salaryForm.allowances}
                    onChange={(e) => setSalaryForm({ ...salaryForm, allowances: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deductions Breakdown</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', mb: '4px' }}>Income Tax (₹)</label>
                  <input
                    type="number"
                    value={salaryForm.tax}
                    onChange={(e) => setSalaryForm({ ...salaryForm, tax: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', mb: '4px' }}>PF (₹)</label>
                  <input
                    type="number"
                    value={salaryForm.pf}
                    onChange={(e) => setSalaryForm({ ...salaryForm, pf: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', mb: '4px' }}>Insurance (₹)</label>
                  <input
                    type="number"
                    value={salaryForm.insurance}
                    onChange={(e) => setSalaryForm({ ...salaryForm, insurance: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', mb: '4px' }}>Other (₹)</label>
                  <input
                    type="number"
                    value={salaryForm.other}
                    onChange={(e) => setSalaryForm({ ...salaryForm, other: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Calculated Summary Box */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748b' }}>Calculated Gross Salary:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatCurrency(calcGross)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748b' }}>Total Deductions:</span>
                  <span style={{ fontWeight: 700, color: '#dc2626' }}>{formatCurrency(calcDeductions)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #cbd5e1', fontSize: '1rem' }}>
                  <span style={{ fontWeight: 700, color: '#15803d' }}>Net Salary:</span>
                  <span style={{ fontWeight: 800, color: '#15803d' }}>{formatCurrency(calcNet)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSalary}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 600, cursor: savingSalary ? 'wait' : 'pointer' }}
                >
                  {savingSalary ? 'Saving...' : 'Save Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Animation inline style */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

    </div>
  );
}
