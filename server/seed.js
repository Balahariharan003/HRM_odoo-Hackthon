const { sequelize, User, Profile, Payroll, Notification, Attendance, Leave } = require('./models');

async function seedDatabase() {
  try {
    console.log('Syncing database for seeding...');
    await sequelize.sync({ force: true });

    // 1. Create EMP001 User and Profile
    const empUser = await User.create({
      name: 'John Smith',
      email: 'emp001@dayflow.com',
      role: 'Employee',
    });

    const empProfile = await Profile.create({
      userId: empUser.id,
      employeeId: 'EMP001',
      department: 'Engineering',
      designation: 'Senior Developer',
      status: 'Active',
      salaryStructure: {
        basic: 50000,
        hra: 20000,
        allowances: 10000,
        deductions: {
          tax: 8000,
          pf: 6000,
          insurance: 2000,
          other: 1000,
        },
      },
    });

    // 2. Create HR Officer User and Profile
    const hrUser = await User.create({
      name: 'Sarah HR',
      email: 'hr001@dayflow.com',
      role: 'HR_Officer',
    });

    await Profile.create({
      userId: hrUser.id,
      employeeId: 'HR001',
      department: 'HR',
      designation: 'HR Manager',
      status: 'Active',
    });

    // 3. Create Admin User
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@dayflow.com',
      role: 'Admin',
    });

    await Profile.create({
      userId: adminUser.id,
      employeeId: 'ADM001',
      department: 'Management',
      designation: 'System Administrator',
      status: 'Active',
    });

    // Dates for current and previous month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }

    const todayStr = currentDate.toISOString().split('T')[0];

    // 4. Create Payroll records
    const currentPayroll = await Payroll.create({
      userId: empUser.id,
      month: currentMonth,
      year: currentYear,
      basic: 50000,
      hra: 20000,
      allowances: 10000,
      grossSalary: 80000,
      tax: 8000,
      pf: 6000,
      insurance: 2000,
      otherDeductions: 1000,
      totalDeductions: 17000,
      netSalary: 63000,
      paymentStatus: 'Processed',
      paymentDate: todayStr,
    });

    const prevPayroll = await Payroll.create({
      userId: empUser.id,
      month: prevMonth,
      year: prevYear,
      basic: 50000,
      hra: 20000,
      allowances: 10000,
      grossSalary: 80000,
      tax: 8000,
      pf: 6000,
      insurance: 2000,
      otherDeductions: 1000,
      totalDeductions: 17000,
      netSalary: 63000,
      paymentStatus: 'Processed',
      paymentDate: todayStr,
    });

    // 5. Create Seed Notifications for EMP001 (2 unread, 1 read)
    const notif1 = await Notification.create({
      userId: empUser.id,
      type: 'leave_approved',
      title: 'Leave Request Approved',
      message: 'Your annual leave request from 2026-09-01 to 2026-09-03 has been approved.',
      isRead: false,
      link: '/leave/my-leaves',
    });

    const notif2 = await Notification.create({
      userId: empUser.id,
      type: 'payroll_processed',
      title: 'Payroll Processed',
      message: `Your payroll for ${currentMonth}/${currentYear} has been processed. Net Salary: $63000.`,
      isRead: false,
      link: `/payroll/payslip/${currentPayroll.id}`,
    });

    const notif3 = await Notification.create({
      userId: empUser.id,
      type: 'attendance_reminder',
      title: 'Attendance Reminder',
      message: 'Please ensure your daily check-in is logged before 09:30 AM.',
      isRead: true,
      link: '/attendance',
    });

    // 6. Create Seed Attendance & Leave records
    await Attendance.create({
      userId: empUser.id,
      date: todayStr,
      status: 'Present',
      checkIn: '09:00 AM',
      checkOut: '05:00 PM',
    });

    await Leave.create({
      userId: empUser.id,
      leaveType: 'annual',
      startDate: '2026-09-01',
      endDate: '2026-09-03',
      reason: 'Vacation',
      status: 'Approved',
    });

    await Leave.create({
      userId: empUser.id,
      leaveType: 'sick',
      startDate: '2026-09-10',
      endDate: '2026-09-11',
      reason: 'Flu',
      status: 'Pending',
    });

    console.log('Seeding completed successfully!');
    console.log('Seeded Users: EMP001, HR001, ADM001');
    console.log('Seeded Notifications for EMP001: 2 unread, 1 read');

    return { empUser, hrUser, adminUser, currentPayroll, prevPayroll, notif1, notif2, notif3 };
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
