const { sequelize, User, Payroll, Notification } = require('./models');

async function runSyncAndTests() {
  try {
    console.log('Syncing database models...');
    await sequelize.sync({ force: true });
    console.log('Database synced successfully.');

    // 1. Verify tables in sqlite_master
    const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
    const tableNames = results.map(r => r.name);
    console.log('Created tables:', tableNames);

    const requiredTables = ['Users', 'Payrolls', 'Notifications'];
    for (const table of requiredTables) {
      if (!tableNames.includes(table)) {
        throw new Error(`Table ${table} was not created!`);
      }
    }
    console.log('All required tables (Users, Payrolls, Notifications) are present.');

    // 2. Test User creation
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
    });
    console.log(`User created: ${user.id}`);

    // 3. Test Payroll creation & auto-calculation
    const payroll = await Payroll.create({
      userId: user.id,
      month: 8,
      year: 2026,
      basic: 50000.00,
      hra: 20000.00,
      allowances: 10000.00,
      tax: 5000.00,
      pf: 3000.00,
      insurance: 2000.00,
      otherDeductions: 1000.00,
    });

    console.log('Payroll created:', {
      id: payroll.id,
      grossSalary: payroll.grossSalary,
      totalDeductions: payroll.totalDeductions,
      netSalary: payroll.netSalary,
    });

    if (parseFloat(payroll.grossSalary) !== 80000.00) {
      throw new Error(`grossSalary calculation failed: expected 80000, got ${payroll.grossSalary}`);
    }
    if (parseFloat(payroll.totalDeductions) !== 11000.00) {
      throw new Error(`totalDeductions calculation failed: expected 11000, got ${payroll.totalDeductions}`);
    }
    if (parseFloat(payroll.netSalary) !== 69000.00) {
      throw new Error(`netSalary calculation failed: expected 69000, got ${payroll.netSalary}`);
    }
    console.log('Payroll calculation validation PASSED.');

    // 4. Test unique constraint on Payroll (userId + month + year)
    try {
      await Payroll.create({
        userId: user.id,
        month: 8,
        year: 2026,
        basic: 50000.00,
        hra: 20000.00,
        allowances: 10000.00,
        tax: 5000.00,
        pf: 3000.00,
        insurance: 2000.00,
        otherDeductions: 1000.00,
      });
      throw new Error('Unique constraint failed: Duplicate payroll allowed!');
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError' || err.message.includes('UNIQUE constraint failed')) {
        console.log('Payroll unique constraint (userId + month + year) PASSED.');
      } else {
        throw err;
      }
    }

    // 5. Test Payroll calculation validation error on invalid grossSalary
    try {
      await Payroll.create({
        userId: user.id,
        month: 9,
        year: 2026,
        basic: 1000,
        hra: 500,
        allowances: 200,
        grossSalary: 99999, // Incorrect grossSalary
        tax: 100,
        pf: 50,
        insurance: 20,
        otherDeductions: 10,
        totalDeductions: 180,
        netSalary: 99819,
      });
      throw new Error('Validation failed: Allowed mismatched grossSalary!');
    } catch (err) {
      if (err.message.includes('grossSalary must equal basic + hra + allowances')) {
        console.log('Payroll grossSalary validation PASSED.');
      } else {
        throw err;
      }
    }

    // 6. Test Notification creation & auto-set createdAt
    const notification = await Notification.create({
      userId: user.id,
      type: 'payroll_processed',
      title: 'Salary Credited',
      message: 'Your salary for August 2026 has been processed.',
      link: '/payroll/August-2026',
    });

    console.log('Notification created:', {
      id: notification.id,
      createdAt: notification.createdAt,
      type: notification.type,
      title: notification.title,
    });

    if (!notification.createdAt) {
      throw new Error('Notification auto-set createdAt failed!');
    }
    console.log('Notification auto-set createdAt PASSED.');

    console.log('\n--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
  } catch (error) {
    console.error('Sync error:', error);
    process.exit(1);
  }
}

runSyncAndTests();
