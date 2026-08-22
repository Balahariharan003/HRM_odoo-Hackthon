import React, { useState, useEffect } from 'react';
import { getMyPayroll, downloadPayslip } from '../../services/payrollService';
import { Download, Calendar, History, FileText, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = [2024, 2025, 2026];

export default function PayrollView() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showHistory, setShowHistory] = useState(false);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [downloading, setDownloading] = useState(false);

  const fetchPayroll = async (month, year) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyPayroll(month, year);
      setPayroll(data);
    } catch (err) {
      console.error('Failed to fetch payroll:', err);
      setError('Unable to fetch payroll record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll(selectedMonth, selectedYear);
  }, []);

  const handleViewClick = () => {
    fetchPayroll(selectedMonth, selectedYear);
  };

  const handleDownload = async () => {
    if (!payroll) return;
    setDownloading(true);
    try {
      const data = await downloadPayslip(payroll.id);
      
      // Simulate file download or show payslip JSON summary
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payslip_${MONTH_NAMES[payroll.month - 1]}_${payroll.year}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download payslip.');
    } finally {
      setDownloading(false);
    }
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val || 0);
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Processed':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, backgroundColor: '#dcfce7', color: '#15803d' }}>
            <CheckCircle size={16} /> Processed
          </span>
        );
      case 'Pending':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, backgroundColor: '#fef9c3', color: '#a16207' }}>
            <Clock size={16} /> Pending
          </span>
        );
      case 'Failed':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, backgroundColor: '#fee2e2', color: '#b91c1c' }}>
            <XCircle size={16} /> Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      
      {/* Top Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>My Payroll & Payslips</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.95rem' }}>View earnings, deductions, and download official monthly payslips</p>
        </div>

        {/* Top Section — Month/Year Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#64748b" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', fontSize: '0.9rem', color: '#334155', outline: 'none' }}
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>{name}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', fontSize: '0.9rem', color: '#334155', outline: 'none' }}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleViewClick}
            disabled={loading}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '7px 16px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Fetching...' : 'View'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '4px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#64748b', marginTop: '16px' }}>Loading payroll data...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '32px', textAlign: 'center', background: '#fff1f2', borderRadius: '16px', border: '1px solid #fecdd3', color: '#9f1239' }}>
          <AlertCircle size={32} style={{ marginBottom: '8px' }} />
          <p style={{ margin: 0, fontWeight: 600 }}>{error}</p>
        </div>
      ) : !payroll ? (
        /* Empty State */
        <div style={{ padding: '60px 24px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#94a3b8' }}>
            <FileText size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>
            No payroll record found for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </h3>
          <p style={{ color: '#64748b', margin: '0 0 20px 0', fontSize: '0.95rem' }}>
            Payroll for this period has not been processed yet or no record exists.
          </p>
          <span style={{ fontSize: '0.875rem', color: '#94a3b8', background: '#f8fafc', padding: '8px 16px', borderRadius: '9999px', border: '1px solid #e2e8f0' }}>
            Contact HR if you believe this is an error.
          </span>
        </div>
      ) : (
        /* Middle Section — Payslip Card */
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
          
          {/* Card Header */}
          <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>Official Document</span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 700 }}>Dayflow HRMS — Payslip</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Pay Period</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
                {MONTH_NAMES[payroll.month - 1]} {payroll.year}
              </div>
            </div>
          </div>

          {/* Employee Details Header */}
          <div style={{ padding: '24px 32px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Employee Name</span>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                  {payroll.User?.name || 'N/A'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Employee ID</span>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                  {payroll.User?.Profile?.employeeId || 'EMP001'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Department</span>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                  {payroll.User?.Profile?.department || 'Engineering'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Designation</span>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                  {payroll.User?.Profile?.designation || 'Software Engineer'}
                </div>
              </div>
            </div>
          </div>

          {/* Salary Breakdown Table */}
          <div style={{ padding: '24px 32px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700 }}>Earnings</th>
                  <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, borderLeft: '1px solid #e2e8f0' }}>Deductions</th>
                  <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>Basic Salary</td>
                  <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500, textAlign: 'right' }}>{formatCurrency(payroll.basic)}</td>
                  <td style={{ padding: '12px 16px', color: '#475569', borderLeft: '1px solid #f1f5f9' }}>Income Tax</td>
                  <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500, textAlign: 'right' }}>{formatCurrency(payroll.tax)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>House Rent Allowance (HRA)</td>
                  <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500, textAlign: 'right' }}>{formatCurrency(payroll.hra)}</td>
                  <td style={{ padding: '12px 16px', color: '#475569', borderLeft: '1px solid #f1f5f9' }}>Provident Fund (PF)</td>
                  <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500, textAlign: 'right' }}>{formatCurrency(payroll.pf)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>Special Allowances</td>
                  <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500, textAlign: 'right' }}>{formatCurrency(payroll.allowances)}</td>
                  <td style={{ padding: '12px 16px', color: '#475569', borderLeft: '1px solid #f1f5f9' }}>Health Insurance</td>
                  <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500, textAlign: 'right' }}>{formatCurrency(payroll.insurance)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 16px', color: '#475569' }}></td>
                  <td style={{ padding: '12px 16px' }}></td>
                  <td style={{ padding: '12px 16px', color: '#475569', borderLeft: '1px solid #f1f5f9' }}>Other Deductions</td>
                  <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500, textAlign: 'right' }}>{formatCurrency(payroll.otherDeductions)}</td>
                </tr>
                <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                  <td style={{ padding: '14px 16px', color: '#0f172a' }}>Gross Salary</td>
                  <td style={{ padding: '14px 16px', color: '#0f172a', textAlign: 'right' }}>{formatCurrency(payroll.grossSalary)}</td>
                  <td style={{ padding: '14px 16px', color: '#0f172a', borderLeft: '1px solid #e2e8f0' }}>Total Deductions</td>
                  <td style={{ padding: '14px 16px', color: '#dc2626', textAlign: 'right' }}>{formatCurrency(payroll.totalDeductions)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom Banner — Net Salary & Payment Details */}
          <div style={{ margin: '0 32px 24px 32px', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Salary Disbursed</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                {formatCurrency(payroll.netSalary)}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#166534', display: 'block' }}>Payment Status</span>
                <div style={{ marginTop: '4px' }}>
                  {getStatusBadge(payroll.paymentStatus)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.85rem', color: '#166534', display: 'block' }}>Payment Date</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#14532d', marginTop: '4px' }}>
                  {formatDate(payroll.paymentDate)}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ padding: '20px 32px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: downloading ? 'wait' : 'pointer',
                boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                transition: 'all 0.2s',
              }}
            >
              <Download size={18} />
              {downloading ? 'Downloading...' : 'Download Payslip'}
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ffffff',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '10px 18px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <History size={18} />
              {showHistory ? 'Hide History' : 'View History'}
            </button>
          </div>

          {/* View History Drawer/Section */}
          {showHistory && (
            <div style={{ padding: '24px 32px', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '1.1rem', fontWeight: 600 }}>Quick Period Selection</h4>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {[
                  { month: 8, year: 2026, label: 'August 2026' },
                  { month: 7, year: 2026, label: 'July 2026' },
                  { month: 6, year: 2026, label: 'June 2026' },
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedMonth(item.month);
                      setSelectedYear(item.year);
                      fetchPayroll(item.month, item.year);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: (selectedMonth === item.month && selectedYear === item.year) ? '#eff6ff' : '#f8fafc',
                      color: (selectedMonth === item.month && selectedYear === item.year) ? '#2563eb' : '#475569',
                      fontWeight: (selectedMonth === item.month && selectedYear === item.year) ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Animation inline style */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}
