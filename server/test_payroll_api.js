const request = require('supertest');
const app = require('./app');
const seedDatabase = require('./seed');

async function testPayrollAPI() {
  console.log('=== STARTING PAYROLL BACKEND API VERIFICATION TESTS ===\n');

  // 1. Seed database
  const { empUser, hrUser, adminUser, currentPayroll, prevPayroll } = await seedDatabase();

  // Test 1: GET /api/payroll/me (Employee gets current month payroll)
  console.log('Test 1: GET /api/payroll/me (Employee)');
  const res1 = await request(app)
    .get('/api/payroll/me')
    .set('x-user-id', empUser.id);

  console.log('Status:', res1.status);
  console.log('Response:', JSON.stringify(res1.body, null, 2));
  if (res1.status !== 200 || !res1.body.id || parseFloat(res1.body.netSalary) !== 63000) {
    throw new Error('Test 1 Failed: getMyPayroll returned invalid response');
  }
  console.log('✅ Test 1 PASSED!\n');

  // Test 1b: GET /api/payroll/me?month=...&year=... (Employee gets previous month payroll)
  console.log('Test 1b: GET /api/payroll/me?month=... (Previous Month)');
  const res1b = await request(app)
    .get(`/api/payroll/me?month=${prevPayroll.month}&year=${prevPayroll.year}`)
    .set('x-user-id', empUser.id);

  console.log('Status:', res1b.status);
  if (res1b.status !== 200 || res1b.body.id !== prevPayroll.id) {
    throw new Error('Test 1b Failed: getMyPayroll for previous month returned invalid response');
  }
  console.log('✅ Test 1b PASSED!\n');

  // Test 2: GET /api/payroll (Admin/HR lists all payrolls)
  console.log('Test 2: GET /api/payroll (HR Officer)');
  const res2 = await request(app)
    .get('/api/payroll?page=1&limit=10')
    .set('x-user-id', hrUser.id);

  console.log('Status:', res2.status);
  console.log('Response summary:', { totalItems: res2.body.totalItems, payrollsCount: res2.body.payrolls.length });
  if (res2.status !== 200 || !res2.body.payrolls || res2.body.totalItems < 2) {
    throw new Error('Test 2 Failed: getAllPayroll returned invalid response');
  }
  console.log('✅ Test 2 PASSED!\n');

  // Test 2b: GET /api/payroll as Employee (should be 403 Forbidden)
  console.log('Test 2b: GET /api/payroll (Employee role check - expecting 403)');
  const res2b = await request(app)
    .get('/api/payroll')
    .set('x-user-id', empUser.id);

  console.log('Status:', res2b.status);
  if (res2b.status !== 403) {
    throw new Error('Test 2b Failed: Employee was not forbidden from accessing getAllPayroll');
  }
  console.log('✅ Test 2b PASSED!\n');

  // Test 3: PUT /api/payroll/:employeeId (Admin updates salary structure)
  console.log('Test 3: PUT /api/payroll/EMP001 (Admin updates salary structure)');
  const res3 = await request(app)
    .put('/api/payroll/EMP001')
    .set('x-user-id', adminUser.id)
    .send({
      basic: 60000,
      hra: 24000,
      allowances: 12000,
      deductions: {
        tax: 9600,
        pf: 7200,
        insurance: 2000,
        other: 1200,
      },
      effectiveDate: '2026-08-01',
    });

  console.log('Status:', res3.status);
  console.log('Response:', JSON.stringify(res3.body, null, 2));
  if (res3.status !== 200 || parseFloat(res3.body.payroll.grossSalary) !== 96000 || parseFloat(res3.body.payroll.netSalary) !== 76000) {
    throw new Error('Test 3 Failed: updateSalaryStructure returned invalid calculations');
  }
  console.log('✅ Test 3 PASSED!\n');

  // Test 4: POST /api/payroll/process (HR processes monthly payroll for all employees)
  console.log('Test 4: POST /api/payroll/process (HR batch processes monthly payroll)');
  const res4 = await request(app)
    .post('/api/payroll/process')
    .set('x-user-id', hrUser.id)
    .send({
      month: 9,
      year: 2026,
    });

  console.log('Status:', res4.status);
  console.log('Response:', JSON.stringify(res4.body, null, 2));
  if (res4.status !== 200 || res4.body.totalProcessed < 1) {
    throw new Error('Test 4 Failed: processMonthlyPayroll failed to process active employees');
  }
  console.log('✅ Test 4 PASSED!\n');

  // Test 5: GET /api/payroll/payslip/:payrollId (Download payslip)
  console.log(`Test 5: GET /api/payroll/payslip/${currentPayroll.id} (Download payslip)`);
  const res5 = await request(app)
    .get(`/api/payroll/payslip/${currentPayroll.id}`)
    .set('x-user-id', empUser.id);

  console.log('Status:', res5.status);
  console.log('Response:', JSON.stringify(res5.body, null, 2));
  if (res5.status !== 200 || !res5.body.downloadUrl || !res5.body.earnings) {
    throw new Error('Test 5 Failed: downloadPayslip returned invalid payload');
  }
  console.log('✅ Test 5 PASSED!\n');

  console.log('=====================================================');
  console.log('🎉 ALL PAYROLL BACKEND API TESTS PASSED SUCCESSFULLY!');
  console.log('=====================================================');
}

testPayrollAPI().catch((err) => {
  console.error('API Verification Test Error:', err);
  process.exit(1);
});
