const { User, Profile, Attendance, Leave, Payroll, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * 1. getAttendanceReport
 * Admin/HR only — Attendance aggregations with JSON/CSV/PDF formats
 */
const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, department, format } = req.query;

    const profileWhere = {};
    if (department) {
      profileWhere.department = department;
    }

    const attendanceWhere = {};
    if (startDate && endDate) {
      attendanceWhere.date = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      attendanceWhere.date = { [Op.gte]: startDate };
    } else if (endDate) {
      attendanceWhere.date = { [Op.lte]: endDate };
    }

    const profiles = await Profile.findAll({
      where: profileWhere,
      include: [{ model: User }],
    });

    const userIds = profiles.map((p) => p.userId);

    const attendances = await Attendance.findAll({
      where: {
        ...attendanceWhere,
        userId: { [Op.in]: userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000'] },
      },
      include: [
        {
          model: User,
          include: [{ model: Profile, as: 'profile' }],
        },
      ],
    });

    let totalPresent = 0;
    let totalAbsent = 0;
    let totalHalfDay = 0;
    let totalLeave = 0;

    const deptMap = {};

    attendances.forEach((a) => {
      const dept = a.User && a.User.Profile ? a.User.Profile.department : 'General';
      if (!deptMap[dept]) {
        deptMap[dept] = { department: dept, totalRecords: 0, present: 0, absent: 0, halfDay: 0, leave: 0 };
      }

      deptMap[dept].totalRecords++;

      if (a.status === 'Present') {
        totalPresent++;
        deptMap[dept].present++;
      } else if (a.status === 'Absent') {
        totalAbsent++;
        deptMap[dept].absent++;
      } else if (a.status === 'HalfDay') {
        totalHalfDay++;
        deptMap[dept].halfDay++;
      } else if (a.status === 'Leave') {
        totalLeave++;
        deptMap[dept].leave++;
      }
    });

    const totalRecords = attendances.length;
    const avgAttendanceNum = totalRecords > 0 ? (((totalPresent + 0.5 * totalHalfDay) / totalRecords) * 100).toFixed(1) : '0.0';
    const avgAttendance = `${avgAttendanceNum}%`;

    const departmentBreakdown = Object.values(deptMap);

    const reportData = {
      totalEmployees: profiles.length,
      totalRecords,
      avgAttendance,
      totalPresent,
      totalAbsent,
      totalHalfDay,
      totalLeave,
      breakdown: departmentBreakdown,
    };

    if (format === 'csv') {
      let csv = 'Department,Total Records,Present,Absent,HalfDay,Leave\n';
      departmentBreakdown.forEach((d) => {
        csv += `"${d.department}",${d.totalRecords},${d.present},${d.absent},${d.halfDay},${d.leave}\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.csv');
      return res.status(200).send(csv);
    }

    if (format === 'pdf') {
      return res.status(200).json({
        message: 'PDF generation requested (v2 feature preview)',
        format: 'pdf',
        reportData,
      });
    }

    return res.status(200).json(reportData);
  } catch (error) {
    console.error('Error in getAttendanceReport:', error);
    return res.status(500).json({ message: 'Error generating attendance report', error: error.message });
  }
};

/**
 * 2. getLeaveReport
 * Admin/HR only — Leave requests report with JSON/CSV/PDF formats
 */
const getLeaveReport = async (req, res) => {
  try {
    const { year: inputYear, department, format } = req.query;
    const year = parseInt(inputYear) || new Date().getFullYear();

    const profileWhere = {};
    if (department) {
      profileWhere.department = department;
    }

    const profiles = await Profile.findAll({
      where: profileWhere,
      include: [{ model: User }],
    });

    const userIds = profiles.map((p) => p.userId);

    const leaves = await Leave.findAll({
      where: {
        userId: { [Op.in]: userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000'] },
        [Op.or]: [
          sequelize.where(sequelize.fn('strftime', '%Y', sequelize.col('Leave.startDate')), year.toString()),
          sequelize.where(sequelize.fn('strftime', '%Y', sequelize.col('Leave.createdAt')), year.toString()),
        ],
      },
      include: [
        {
          model: User,
          include: [{ model: Profile, as: 'profile' }],
        },
      ],
    });

    let approved = 0;
    let rejected = 0;
    let pending = 0;

    const byType = {
      paid: 0,
      sick: 0,
      unpaid: 0,
      annual: 0,
      other: 0,
    };

    const deptMap = {};

    leaves.forEach((l) => {
      const dept = l.User && l.User.Profile ? l.User.Profile.department : 'General';
      if (!deptMap[dept]) {
        deptMap[dept] = { department: dept, totalRequests: 0, approved: 0, rejected: 0, pending: 0 };
      }

      deptMap[dept].totalRequests++;

      if (l.status === 'Approved') {
        approved++;
        deptMap[dept].approved++;
      } else if (l.status === 'Rejected') {
        rejected++;
        deptMap[dept].rejected++;
      } else {
        pending++;
        deptMap[dept].pending++;
      }

      const lType = (l.leaveType || 'other').toLowerCase();
      if (byType[lType] !== undefined) {
        byType[lType]++;
      } else {
        byType.other++;
      }
    });

    const reportData = {
      year,
      totalRequests: leaves.length,
      approved,
      rejected,
      pending,
      byType,
      breakdown: Object.values(deptMap),
    };

    if (format === 'csv') {
      let csv = 'Department,Total Requests,Approved,Rejected,Pending\n';
      Object.values(deptMap).forEach((d) => {
        csv += `"${d.department}",${d.totalRequests},${d.approved},${d.rejected},${d.pending}\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=leave_report.csv');
      return res.status(200).send(csv);
    }

    if (format === 'pdf') {
      return res.status(200).json({
        message: 'PDF generation requested (v2 feature preview)',
        format: 'pdf',
        reportData,
      });
    }

    return res.status(200).json(reportData);
  } catch (error) {
    console.error('Error in getLeaveReport:', error);
    return res.status(500).json({ message: 'Error generating leave report', error: error.message });
  }
};

/**
 * 3. getPayrollReport
 * Admin/HR only — Payroll summary report with JSON/CSV/PDF formats
 */
const getPayrollReport = async (req, res) => {
  try {
    const currentDate = new Date();
    const month = parseInt(req.query.month) || (currentDate.getMonth() + 1);
    const year = parseInt(req.query.year) || currentDate.getFullYear();
    const { format } = req.query;

    const payrolls = await Payroll.findAll({
      where: { month, year },
      include: [
        {
          model: User,
          include: [{ model: Profile, as: 'profile' }],
        },
      ],
    });

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    const deptMap = {};

    payrolls.forEach((p) => {
      const dept = p.User && p.User.Profile ? p.User.Profile.department : 'General';
      if (!deptMap[dept]) {
        deptMap[dept] = { department: dept, totalEmployees: 0, gross: 0, deductions: 0, net: 0 };
      }

      const gross = parseFloat(p.grossSalary || 0);
      const ded = parseFloat(p.totalDeductions || 0);
      const net = parseFloat(p.netSalary || 0);

      totalGross += gross;
      totalDeductions += ded;
      totalNet += net;

      deptMap[dept].totalEmployees++;
      deptMap[dept].gross += gross;
      deptMap[dept].deductions += ded;
      deptMap[dept].net += net;
    });

    const breakdown = Object.values(deptMap).map((d) => ({
      department: d.department,
      totalEmployees: d.totalEmployees,
      gross: parseFloat(d.gross.toFixed(2)),
      deductions: parseFloat(d.deductions.toFixed(2)),
      net: parseFloat(d.net.toFixed(2)),
    }));

    const reportData = {
      month,
      year,
      totalEmployees: payrolls.length,
      totalGross: parseFloat(totalGross.toFixed(2)),
      totalDeductions: parseFloat(totalDeductions.toFixed(2)),
      totalNet: parseFloat(totalNet.toFixed(2)),
      breakdown,
    };

    if (format === 'csv') {
      let csv = 'Department,Total Employees,Gross Salary,Total Deductions,Net Salary\n';
      breakdown.forEach((d) => {
        csv += `"${d.department}",${d.totalEmployees},${d.gross},${d.deductions},${d.net}\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=payroll_report.csv');
      return res.status(200).send(csv);
    }

    if (format === 'pdf') {
      return res.status(200).json({
        message: 'PDF generation requested (v2 feature preview)',
        format: 'pdf',
        reportData,
      });
    }

    return res.status(200).json(reportData);
  } catch (error) {
    console.error('Error in getPayrollReport:', error);
    return res.status(500).json({ message: 'Error generating payroll report', error: error.message });
  }
};

/**
 * 4. getDashboardAnalytics
 * Admin/HR only — High-level dashboard metrics for employees, attendance, leave, and payroll
 */
const getDashboardAnalytics = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // 1. Employees analytics
    const totalEmployees = await User.count();
    const newThisMonth = await User.count({
      where: {
        createdAt: { [Op.gte]: firstDayOfMonth },
      },
    });

    // 2. Today's Attendance
    const todayPresent = await Attendance.count({ where: { date: todayStr, status: 'Present' } });
    const todayAbsent = await Attendance.count({ where: { date: todayStr, status: 'Absent' } });
    const todayOnLeave = await Attendance.count({ where: { date: todayStr, status: 'Leave' } });

    // 3. Leave analytics
    const pendingRequests = await Leave.count({ where: { status: 'Pending' } });
    const approvedThisMonth = await Leave.count({
      where: {
        status: 'Approved',
        updatedAt: { [Op.gte]: firstDayOfMonth },
      },
    });

    // 4. Payroll analytics
    const lastProcessedPayroll = await Payroll.findOne({
      where: { paymentStatus: 'Processed' },
      order: [['paymentDate', 'DESC'], ['updatedAt', 'DESC']],
    });

    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const monthlyPayrolls = await Payroll.findAll({
      where: { month: currentMonth, year: currentYear, paymentStatus: 'Processed' },
    });

    const totalMonthlyPayout = monthlyPayrolls.reduce((sum, p) => sum + parseFloat(p.netSalary || 0), 0);

    return res.status(200).json({
      employees: {
        total: totalEmployees,
        newThisMonth,
      },
      attendance: {
        todayPresent,
        todayAbsent,
        todayOnLeave,
      },
      leave: {
        pendingRequests,
        approvedThisMonth,
      },
      payroll: {
        lastProcessed: lastProcessedPayroll ? lastProcessedPayroll.paymentDate : null,
        totalMonthlyPayout: parseFloat(totalMonthlyPayout.toFixed(2)),
      },
    });
  } catch (error) {
    console.error('Error in getDashboardAnalytics:', error);
    return res.status(500).json({ message: 'Error loading dashboard analytics', error: error.message });
  }
};

module.exports = {
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
  getDashboardAnalytics,
};
