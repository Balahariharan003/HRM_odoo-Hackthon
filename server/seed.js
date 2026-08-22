const bcrypt = require('bcryptjs');
const { sequelize, User, Profile, Attendance, Leave, Payroll, Notification } = require('./models');

async function seedDatabase() {
  try {
    console.log('Syncing database with force: true to recreate all tables...');
    await sequelize.sync({ force: true });
    console.log('Database synced. All tables recreated.');

    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const employeePasswordHash = await bcrypt.hash('Emp@123', 10);

    // 1. Create Admin User & Profile
    const adminUser = await User.create({
      employeeId: 'ADM001',
      email: 'admin@dayflow.com',
      password: adminPasswordHash,
      role: 'Admin',
      isVerified: true,
    });

    const adminProfile = await Profile.create({
      userId: adminUser.id,
      firstName: 'System',
      lastName: 'Admin',
      phone: '1234567890',
      address: 'DayFlow HQ, Tech City',
      department: 'Management',
      designation: 'System Administrator',
      joinDate: '2024-01-01',
      salaryStructure: {
        basic: 70000,
        hra: 25000,
        allowances: 15000,
        deductions: 10000,
        netSalary: 100000,
      },
    });

    console.log('Seeded Admin User (admin@dayflow.com)');

    // 2. Create Employee User & Profile
    const empUser = await User.create({
      employeeId: 'EMP001',
      email: 'emp@dayflow.com',
      password: employeePasswordHash,
      role: 'Employee',
      isVerified: true,
    });

    const empProfile = await Profile.create({
      userId: empUser.id,
      firstName: 'John',
      lastName: 'Doe',
      phone: '9876543210',
      address: '123 Tech Street, Metro',
      department: 'Engineering',
      designation: 'Software Engineer',
      joinDate: '2024-02-01',
      salaryStructure: {
        basic: 50000,
        hra: 20000,
        allowances: 10000,
        deductions: 5000,
        netSalary: 75000,
      },
    });

    console.log('Seeded Employee User (emp@dayflow.com)');

    // 3. Create Attendance Records
    const today = new Date().toISOString().split('T')[0];
    const attendanceRecord = await Attendance.create({
      userId: empUser.id,
      date: today,
      checkIn: '09:00:00',
      checkOut: '17:00:00',
      totalHours: 8.0,
      status: 'Present',
      location: 'Office',
      notes: 'On-time arrival',
    });

    console.log('Seeded Attendance record');

    // 4. Create Leave Request
    const leaveRecord = await Leave.create({
      userId: empUser.id,
      leaveType: 'Paid',
      startDate: '2026-09-01',
      endDate: '2026-09-03',
      totalDays: 3,
      reason: 'Annual family vacation trip to hills',
      status: 'Approved',
      approvedBy: adminUser.id,
      approvedAt: new Date(),
      comments: 'Approved by admin',
    });

    console.log('Seeded Leave request');

    // 5. Create Payroll Record
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const payrollRecord = await Payroll.create({
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
      paymentDate: today,
    });

    console.log('Seeded Payroll record');

    // 6. Create Notification Record
    const notificationRecord = await Notification.create({
      userId: empUser.id,
      type: 'leave_approved',
      title: 'Leave Request Approved',
      message: 'Your paid leave request for Sep 1 - Sep 3 has been approved.',
      isRead: false,
      link: '/leave/my-leaves',
    });

    console.log('Seeded Notification record');

    // Count and print all tables
    const userCount = await User.count();
    const profileCount = await Profile.count();
    const attendanceCount = await Attendance.count();
    const leaveCount = await Leave.count();
    const payrollCount = await Payroll.count();
    const notificationCount = await Notification.count();

    console.log('\n--- SEEDING COMPLETED SUCCESSFULLY ---');
    console.log(`Users Table: ${userCount} records`);
    console.log(`Profiles Table: ${profileCount} records`);
    console.log(`Attendances Table: ${attendanceCount} records`);
    console.log(`Leaves Table: ${leaveCount} records`);
    console.log(`Payrolls Table: ${payrollCount} records`);
    console.log(`Notifications Table: ${notificationCount} records`);

    return true;
  } catch (error) {
    console.error('Error during database seeding:', error);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedDatabase;
