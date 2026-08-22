const bcrypt = require('bcryptjs');
const { sequelize, User, Profile } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('Connecting to database and syncing models...');
    await sequelize.authenticate();
    console.log('Database connection authenticated.');

    // Sync database (force: true recreates tables)
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully.');

    // Hash passwords
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

    await Profile.create({
      userId: adminUser.id,
      firstName: 'System',
      lastName: 'Admin',
      phone: '1234567890',
      address: 'DayFlow Headquarters, Tech Park, City',
      department: 'Management',
      designation: 'System Administrator',
      joinDate: '2024-01-01',
      profilePicture: '',
      documents: [
        { name: 'ID Proof', path: '/uploads/admin_id.pdf', uploadedAt: new Date().toISOString() }
      ],
      salaryStructure: {
        basic: 50000,
        hra: 20000,
        allowances: 10000,
        deductions: 5000,
        netSalary: 75000,
      },
    });

    console.log('Admin user and profile seeded: admin@dayflow.com (ADM001)');

    // 2. Create Employee User & Profile
    const empUser = await User.create({
      employeeId: 'EMP001',
      email: 'emp@dayflow.com',
      password: employeePasswordHash,
      role: 'Employee',
      isVerified: true,
    });

    await Profile.create({
      userId: empUser.id,
      firstName: 'John',
      lastName: 'Doe',
      phone: '9876543210',
      address: '123 Tech Street, Suburb, City',
      department: 'Engineering',
      designation: 'Software Engineer',
      joinDate: '2024-02-01',
      profilePicture: '',
      documents: [
        { name: 'Resume', path: '/uploads/john_doe_resume.pdf', uploadedAt: new Date().toISOString() }
      ],
      salaryStructure: {
        basic: 30000,
        hra: 12000,
        allowances: 5000,
        deductions: 3000,
        netSalary: 44000,
      },
    });

    console.log('Employee user and profile seeded: emp@dayflow.com (EMP001)');

    // Confirm count
    const userCount = await User.count();
    const profileCount = await Profile.count();
    console.log(`Seeding complete. Total Users: ${userCount}, Total Profiles: ${profileCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
