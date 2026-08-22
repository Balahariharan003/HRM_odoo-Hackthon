const request = require('supertest');
const app = require('./app');
const seedDatabase = require('./seed');

async function testFullModule3Flow() {
  console.log('========================================================================');
  console.log('🚀 TESTING FULL MODULE 3 END-TO-END FLOW (PAYROLL, REPORTS & NOTIFS)');
  console.log('========================================================================\n');

  // 1. Seed fresh database
  const { empUser, hrUser, adminUser, currentPayroll } = await seedDatabase();

  // ---------------------------------------------------
  // EMPLOYEE FLOW
  // ---------------------------------------------------
  console.log('--- Step 1: Employee Flow ---');
  
  // 1.1 Employee views their own payroll
  const resEmpPay = await request(app)
    .get('/api/payroll/me')
    .set('x-user-id', empUser.id);
  console.log('1.1 View Payroll Status:', resEmpPay.status, '| Net Salary:', resEmpPay.body.netSalary);
  if (resEmpPay.status !== 200 || !resEmpPay.body.netSalary) {
    throw new Error('Employee View Payroll Failed');
  }

  // 1.2 Employee downloads payslip
  const resPayslip = await request(app)
    .get(`/api/payroll/payslip/${resEmpPay.body.id}`)
    .set('x-user-id', empUser.id);
  console.log('1.2 Download Payslip Status:', resPayslip.status, '| Payslip URL:', resPayslip.body.downloadUrl);
  if (resPayslip.status !== 200 || !resPayslip.body.downloadUrl) {
    throw new Error('Employee Download Payslip Failed');
  }

  // 1.3 Employee checks notifications
  const resEmpNotifs = await request(app)
    .get('/api/notifications')
    .set('x-user-id', empUser.id);
  console.log('1.3 Check Notifications Status:', resEmpNotifs.status, '| Unread Count:', resEmpNotifs.body.unreadCount);
  if (resEmpNotifs.status !== 200 || resEmpNotifs.body.unreadCount !== 2) {
    throw new Error('Employee Check Notifications Failed');
  }
  console.log('✅ Employee Flow PASSED!\n');

  // ---------------------------------------------------
  // ADMIN / HR FLOW
  // ---------------------------------------------------
  console.log('--- Step 2: Admin / HR Control Flow ---');

  // 2.1 Admin views all employee payroll records
  const resAllPayroll = await request(app)
    .get('/api/payroll')
    .set('x-user-id', hrUser.id);
  console.log('2.1 View All Payroll Status:', resAllPayroll.status, '| Total Items:', resAllPayroll.body.totalItems);
  if (resAllPayroll.status !== 200 || resAllPayroll.body.totalItems < 1) {
    throw new Error('Admin View All Payroll Failed');
  }

  // 2.2 Admin updates employee salary structure
  const resUpdateSalary = await request(app)
    .put('/api/payroll/EMP001')
    .set('x-user-id', adminUser.id)
    .send({
      basic: 55000,
      hra: 22000,
      allowances: 11000,
      deductions: { tax: 8800, pf: 6600, insurance: 2000, other: 1000 },
      effectiveDate: '2026-08-01',
    });
  console.log('2.2 Edit Salary Status:', resUpdateSalary.status, '| Updated Gross:', resUpdateSalary.body.payroll.grossSalary, '| Net:', resUpdateSalary.body.payroll.netSalary);
  if (resUpdateSalary.status !== 200 || parseFloat(resUpdateSalary.body.payroll.netSalary) !== 69600) {
    throw new Error('Admin Edit Salary Failed');
  }

  // 2.3 HR processes monthly payroll for current month
  const resProcess = await request(app)
    .post('/api/payroll/process')
    .set('x-user-id', hrUser.id)
    .send({ month: 8, year: 2026 });
  console.log('2.3 Process Payroll Status:', resProcess.status, '| Total Processed:', resProcess.body.totalProcessed, '| Total Payout:', resProcess.body.totalPayout);
  if (resProcess.status !== 200 || resProcess.body.totalProcessed < 1) {
    throw new Error('HR Process Payroll Failed');
  }

  // 2.4 Admin views executive dashboard reports & attendance analytics
  const resDashReport = await request(app)
    .get('/api/reports/dashboard')
    .set('x-user-id', adminUser.id);
  console.log('2.4 View Dashboard Reports Status:', resDashReport.status, '| Total Employees:', resDashReport.body.employees.total, '| Monthly Payout:', resDashReport.body.payroll.totalMonthlyPayout);
  if (resDashReport.status !== 200 || !resDashReport.body.payroll) {
    throw new Error('Admin View Dashboard Reports Failed');
  }

  // 2.5 Verify employee receives real-time notification after batch payroll processing
  const resEmpNotifsPost = await request(app)
    .get('/api/notifications')
    .set('x-user-id', empUser.id);
  console.log('2.5 Check Real-time Notification Status:', resEmpNotifsPost.status, '| Updated Total Notifications:', resEmpNotifsPost.body.totalItems);
  if (resEmpNotifsPost.status !== 200 || resEmpNotifsPost.body.totalItems < 4) {
    throw new Error('Real-time Notification Verification Failed');
  }
  console.log('✅ Admin / HR Control Flow PASSED!\n');

  console.log('========================================================================');
  console.log('🎉 ALL MODULE 3 END-TO-END FLOW TESTS PASSED WITH 100% SUCCESS!');
  console.log('========================================================================');
}

testFullModule3Flow().catch((err) => {
  console.error('Module 3 E2E Flow Error:', err);
  process.exit(1);
});
