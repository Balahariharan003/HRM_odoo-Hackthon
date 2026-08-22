const { sequelize, User, Attendance, Leave } = require('../models');

async function testModels() {
  try {
    console.log('--- Starting Model Tests ---');
    await sequelize.sync({ force: true });

    // 1. Create User
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedpassword123',
      role: 'Employee',
    });
    console.log('✓ User created:', user.id);

    const manager = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'hashedpassword123',
      role: 'Manager',
    });
    console.log('✓ Manager created:', manager.id);

    // 2. Attendance model: checkIn, checkOut, totalHours calculation
    const attendance = await Attendance.create({
      userId: user.id,
      date: '2026-08-22',
      checkIn: '09:00:00',
      checkOut: '17:30:00',
      status: 'Present',
      location: 'Office',
      notes: 'On time',
    });
    console.log('✓ Attendance created with totalHours:', attendance.totalHours);
    if (attendance.totalHours !== 8.5) {
      throw new Error(`Expected totalHours to be 8.5, got ${attendance.totalHours}`);
    }

    // 3. Attendance model composite unique validation (userId + date)
    let duplicateError = false;
    try {
      await Attendance.create({
        userId: user.id,
        date: '2026-08-22',
        status: 'Present',
      });
    } catch (err) {
      duplicateError = true;
      console.log('✓ Composite unique constraint (userId + date) enforced successfully!');
    }
    if (!duplicateError) {
      throw new Error('Composite unique constraint on (userId + date) failed to block duplicate record!');
    }

    // 4. Leave model: auto calculation of totalDays
    const leave = await Leave.create({
      userId: user.id,
      leaveType: 'Paid',
      startDate: '2026-09-01',
      endDate: '2026-09-05',
      reason: 'Vacation',
      status: 'Pending',
    });
    console.log('✓ Leave created with totalDays:', leave.totalDays);
    if (leave.totalDays !== 5) {
      throw new Error(`Expected totalDays to be 5, got ${leave.totalDays}`);
    }

    // 5. Leave model validation: endDate >= startDate
    let invalidDateError = false;
    try {
      await Leave.create({
        userId: user.id,
        leaveType: 'Sick',
        startDate: '2026-09-10',
        endDate: '2026-09-05',
        reason: 'Sick leave',
      });
    } catch (err) {
      invalidDateError = true;
      console.log('✓ Validation (endDate >= startDate) enforced successfully!');
    }
    if (!invalidDateError) {
      throw new Error('Validation endDate >= startDate failed to throw error!');
    }

    // 6. Leave model validation: if halfDay is true, halfDaySession is required
    let missingHalfDaySessionError = false;
    try {
      await Leave.create({
        userId: user.id,
        leaveType: 'Sick',
        startDate: '2026-09-10',
        endDate: '2026-09-10',
        halfDay: true,
        reason: 'Dentist appointment',
      });
    } catch (err) {
      missingHalfDaySessionError = true;
      console.log('✓ Validation (halfDaySession required when halfDay is true) enforced successfully!');
    }
    if (!missingHalfDaySessionError) {
      throw new Error('Validation halfDaySession required when halfDay is true failed to throw error!');
    }

    // 7. Leave with halfDay and halfDaySession provided
    const halfDayLeave = await Leave.create({
      userId: user.id,
      leaveType: 'Sick',
      startDate: '2026-09-10',
      endDate: '2026-09-10',
      halfDay: true,
      halfDaySession: 'Morning',
      reason: 'Medical checkup',
    });
    console.log('✓ Half day leave created successfully with session:', halfDayLeave.halfDaySession);

    // 8. Leave approval association test (Leave.belongsTo(User, { as: 'Approver', foreignKey: 'approvedBy' }))
    halfDayLeave.status = 'Approved';
    halfDayLeave.approvedBy = manager.id;
    halfDayLeave.approvedAt = new Date();
    await halfDayLeave.save();

    const fetchedLeave = await Leave.findByPk(halfDayLeave.id, {
      include: [{ model: User, as: 'Approver' }],
    });
    console.log('✓ Leave approval association verified. Approver Name:', fetchedLeave.Approver.name);

    console.log('\nALL TESTS PASSED SUCCESSFULLY! 🎉');
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

testModels();
