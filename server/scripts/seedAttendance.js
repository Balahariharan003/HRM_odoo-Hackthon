const bcrypt = require('bcryptjs');
const { sequelize, User, Profile, Attendance } = require('../models');

async function seedAttendanceData() {
  try {
    console.log('Seeding attendance data...');
    await sequelize.sync({ force: true });

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Seeded Employee (EMP001)
    const employeeUser = await User.create({
      name: 'John Employee',
      email: 'emp001@dayflow.com',
      password: hashedPassword,
      role: 'Employee',
    });

    const employeeProfile = await Profile.create({
      userId: employeeUser.id,
      employeeId: 'EMP001',
      department: 'Engineering',
      designation: 'Software Engineer',
      phone: '+1234567890',
    });

    console.log('✓ Seeded Employee created:', employeeUser.name, '(', employeeProfile.employeeId, ')');

    // 2. Create Seeded Admin / HR Officer
    const adminUser = await User.create({
      name: 'Sarah HR Admin',
      email: 'admin@dayflow.com',
      password: hashedPassword,
      role: 'Admin',
    });

    const adminProfile = await Profile.create({
      userId: adminUser.id,
      employeeId: 'ADM001',
      department: 'Human Resources',
      designation: 'HR Manager',
      phone: '+1987654321',
    });

    console.log('✓ Seeded Admin created:', adminUser.name, '(', adminProfile.employeeId, ')');

    // 3. Seed Attendance Records for EMP001 (8 recent days)
    const seedRecords = [
      {
        date: '2026-08-12',
        checkIn: '09:00:00',
        checkOut: '17:30:00',
        status: 'Present',
        location: 'Office',
        notes: 'Regular check-in',
      },
      {
        date: '2026-08-13',
        checkIn: '09:15:00',
        checkOut: '18:00:00',
        status: 'Present',
        location: 'Office',
        notes: 'Slightly late check-in',
      },
      {
        date: '2026-08-14',
        checkIn: '09:00:00',
        checkOut: '13:00:00',
        status: 'Half-day',
        location: 'Remote',
        notes: 'Half day afternoon off',
      },
      {
        date: '2026-08-15',
        checkIn: null,
        checkOut: null,
        status: 'Absent',
        location: null,
        notes: 'Unexcused absence',
      },
      {
        date: '2026-08-18',
        checkIn: '08:55:00',
        checkOut: '17:15:00',
        status: 'Present',
        location: 'Office',
        notes: 'On time',
      },
      {
        date: '2026-08-19',
        checkIn: null,
        checkOut: null,
        status: 'Leave',
        location: null,
        notes: 'Approved sick leave',
      },
      {
        date: '2026-08-20',
        checkIn: '09:05:00',
        checkOut: '17:45:00',
        status: 'Present',
        location: 'Office',
        notes: 'Normal shift',
      },
      {
        date: '2026-08-21',
        checkIn: '13:00:00',
        checkOut: '17:30:00',
        status: 'Half-day',
        location: 'Remote',
        notes: 'Morning doctor appointment',
      },
    ];

    for (const rec of seedRecords) {
      await Attendance.create({
        userId: employeeUser.id,
        ...rec,
      });
    }

    console.log(`✓ Created ${seedRecords.length} attendance records for EMP001 with mixed statuses.`);

    // 4. Create another employee (EMP002) for leave tests
    const employee2 = await User.create({
      name: 'Jane Marketing',
      email: 'emp002@dayflow.com',
      password: hashedPassword,
      role: 'Employee',
    });

    await Profile.create({
      userId: employee2.id,
      employeeId: 'EMP002',
      department: 'Marketing',
      designation: 'Marketing Specialist',
      phone: '+1555444333',
    });

    console.log('✓ Seeded Employee 2 created: Jane Marketing ( EMP002 )');

    // 5. Seed Leave Requests for EMP001 (1 Pending, 1 Approved, 1 Rejected)
    const { Leave } = require('../models');
    await Leave.create({
      userId: employeeUser.id,
      leaveType: 'Paid',
      startDate: '2026-09-01',
      endDate: '2026-09-03',
      totalDays: 3,
      reason: 'Annual family vacation trip',
      status: 'Pending',
    });

    await Leave.create({
      userId: employeeUser.id,
      leaveType: 'Sick',
      startDate: '2026-08-10',
      endDate: '2026-08-10',
      totalDays: 1,
      reason: 'Severe flu and fever doctor rest',
      status: 'Approved',
      approvedBy: adminUser.id,
      approvedAt: new Date(),
      comments: 'Approved. Get well soon!',
    });

    await Leave.create({
      userId: employeeUser.id,
      leaveType: 'Unpaid',
      startDate: '2026-08-01',
      endDate: '2026-08-02',
      totalDays: 2,
      reason: 'Personal emergency travel event',
      status: 'Rejected',
      approvedBy: adminUser.id,
      approvedAt: new Date(),
      comments: 'Insufficient notice provided',
    });

    console.log('✓ Seeded 3 leave requests for EMP001 (1 Pending, 1 Approved, 1 Rejected)');

    // 6. Seed 2 Pending Leave Requests for EMP002
    await Leave.create({
      userId: employee2.id,
      leaveType: 'Paid',
      startDate: '2026-09-10',
      endDate: '2026-09-12',
      totalDays: 3,
      reason: 'Wedding attendance out of town',
      status: 'Pending',
    });

    await Leave.create({
      userId: employee2.id,
      leaveType: 'Sick',
      startDate: '2026-09-15',
      endDate: '2026-09-15',
      totalDays: 0.5,
      halfDay: true,
      halfDaySession: 'Morning',
      reason: 'Dental procedure scheduled morning',
      status: 'Pending',
    });

    console.log('✓ Seeded 2 pending leave requests for EMP002');
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding attendance data:', error);
    if (require.main === module) process.exit(1);
    throw error;
  } finally {
    if (require.main === module) {
      await sequelize.close();
    }
  }
}

if (require.main === module) {
  seedAttendanceData();
}

module.exports = seedAttendanceData;
