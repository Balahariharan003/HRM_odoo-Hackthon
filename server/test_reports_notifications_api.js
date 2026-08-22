const request = require('supertest');
const app = require('./app');
const seedDatabase = require('./seed');

async function testReportsAndNotificationsAPI() {
  console.log('=== STARTING REPORTS AND NOTIFICATIONS API TESTS ===\n');

  // 1. Seed database
  const { empUser, hrUser, adminUser, notif1, notif2, notif3 } = await seedDatabase();

  // ----------------------------------------------------
  // REPORTS TESTS
  // ----------------------------------------------------

  // Test 1: GET /api/reports/attendance (JSON format)
  console.log('Test 1: GET /api/reports/attendance (Admin/HR - JSON)');
  const resAtt = await request(app)
    .get('/api/reports/attendance')
    .set('x-user-id', hrUser.id);

  console.log('Status:', resAtt.status);
  console.log('Response:', JSON.stringify(resAtt.body, null, 2));
  if (resAtt.status !== 200 || resAtt.body.totalEmployees === undefined || !resAtt.body.avgAttendance) {
    throw new Error('Test 1 Failed: getAttendanceReport returned invalid payload');
  }
  console.log('✅ Test 1 PASSED!\n');

  // Test 1b: GET /api/reports/attendance (CSV format)
  console.log('Test 1b: GET /api/reports/attendance?format=csv');
  const resAttCsv = await request(app)
    .get('/api/reports/attendance?format=csv')
    .set('x-user-id', hrUser.id);

  console.log('Status:', resAttCsv.status);
  console.log('Header Content-Type:', resAttCsv.headers['content-type']);
  console.log('CSV Body Snippet:\n', resAttCsv.text.slice(0, 200));
  if (resAttCsv.status !== 200 || !resAttCsv.text.includes('Department,Total Records')) {
    throw new Error('Test 1b Failed: getAttendanceReport CSV format invalid');
  }
  console.log('✅ Test 1b PASSED!\n');

  // Test 2: GET /api/reports/leave
  console.log('Test 2: GET /api/reports/leave (Admin/HR)');
  const resLeave = await request(app)
    .get('/api/reports/leave')
    .set('x-user-id', hrUser.id);

  console.log('Status:', resLeave.status);
  console.log('Response:', JSON.stringify(resLeave.body, null, 2));
  if (resLeave.status !== 200 || resLeave.body.totalRequests === undefined || !resLeave.body.byType) {
    throw new Error('Test 2 Failed: getLeaveReport returned invalid payload');
  }
  console.log('✅ Test 2 PASSED!\n');

  // Test 3: GET /api/reports/payroll
  console.log('Test 3: GET /api/reports/payroll (Admin/HR)');
  const resPayroll = await request(app)
    .get('/api/reports/payroll')
    .set('x-user-id', hrUser.id);

  console.log('Status:', resPayroll.status);
  console.log('Response:', JSON.stringify(resPayroll.body, null, 2));
  if (resPayroll.status !== 200 || resPayroll.body.totalGross === undefined || !resPayroll.body.breakdown) {
    throw new Error('Test 3 Failed: getPayrollReport returned invalid payload');
  }
  console.log('✅ Test 3 PASSED!\n');

  // Test 4: GET /api/reports/dashboard
  console.log('Test 4: GET /api/reports/dashboard (Admin/HR Analytics)');
  const resDash = await request(app)
    .get('/api/reports/dashboard')
    .set('x-user-id', adminUser.id);

  console.log('Status:', resDash.status);
  console.log('Response:', JSON.stringify(resDash.body, null, 2));
  if (resDash.status !== 200 || !resDash.body.employees || !resDash.body.attendance || !resDash.body.leave || !resDash.body.payroll) {
    throw new Error('Test 4 Failed: getDashboardAnalytics returned invalid payload');
  }
  console.log('✅ Test 4 PASSED!\n');

  // Test 4b: GET /api/reports/dashboard as Employee (should be 403)
  console.log('Test 4b: GET /api/reports/dashboard (Employee role check - expecting 403)');
  const resDashForbidden = await request(app)
    .get('/api/reports/dashboard')
    .set('x-user-id', empUser.id);

  console.log('Status:', resDashForbidden.status);
  if (resDashForbidden.status !== 403) {
    throw new Error('Test 4b Failed: Employee was not forbidden from accessing dashboard analytics');
  }
  console.log('✅ Test 4b PASSED!\n');

  // ----------------------------------------------------
  // NOTIFICATIONS TESTS
  // ----------------------------------------------------

  // Test 5: GET /api/notifications (EMP001 lists notifications)
  console.log('Test 5: GET /api/notifications (EMP001)');
  const resNotif = await request(app)
    .get('/api/notifications')
    .set('x-user-id', empUser.id);

  console.log('Status:', resNotif.status);
  console.log('Response:', JSON.stringify(resNotif.body, null, 2));
  if (resNotif.status !== 200 || resNotif.body.totalItems !== 3 || resNotif.body.unreadCount !== 2) {
    throw new Error(`Test 5 Failed: Expected 3 total items and 2 unread, got totalItems=${resNotif.body.totalItems}, unreadCount=${resNotif.body.unreadCount}`);
  }
  console.log('✅ Test 5 PASSED! (Verified 2 unread and 1 read seed notifications)\n');

  // Test 5b: GET /api/notifications?unreadOnly=true
  console.log('Test 5b: GET /api/notifications?unreadOnly=true');
  const resUnread = await request(app)
    .get('/api/notifications?unreadOnly=true')
    .set('x-user-id', empUser.id);

  console.log('Status:', resUnread.status);
  if (resUnread.status !== 200 || resUnread.body.notifications.length !== 2) {
    throw new Error('Test 5b Failed: unreadOnly filter did not return 2 notifications');
  }
  console.log('✅ Test 5b PASSED!\n');

  // Test 6: PUT /api/notifications/:notificationId/read (Mark single as read)
  console.log(`Test 6: PUT /api/notifications/${notif1.id}/read`);
  const resMarkRead = await request(app)
    .put(`/api/notifications/${notif1.id}/read`)
    .set('x-user-id', empUser.id);

  console.log('Status:', resMarkRead.status);
  console.log('Response:', resMarkRead.body);
  if (resMarkRead.status !== 200 || resMarkRead.body.notification.isRead !== true) {
    throw new Error('Test 6 Failed: markAsRead did not set isRead to true');
  }
  console.log('✅ Test 6 PASSED!\n');

  // Test 7: PUT /api/notifications/read-all (Mark all remaining as read)
  console.log('Test 7: PUT /api/notifications/read-all');
  const resReadAll = await request(app)
    .put('/api/notifications/read-all')
    .set('x-user-id', empUser.id);

  console.log('Status:', resReadAll.status);
  console.log('Response:', resReadAll.body);
  if (resReadAll.status !== 200) {
    throw new Error('Test 7 Failed: markAllAsRead returned error');
  }

  // Verify unread count is now 0
  const resAfterReadAll = await request(app)
    .get('/api/notifications')
    .set('x-user-id', empUser.id);

  if (resAfterReadAll.body.unreadCount !== 0) {
    throw new Error(`Test 7 Failed: Expected 0 unread notifications after read-all, got ${resAfterReadAll.body.unreadCount}`);
  }
  console.log('✅ Test 7 PASSED!\n');

  console.log('================================================================');
  console.log('🎉 ALL REPORTS AND NOTIFICATIONS API TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================');
}

testReportsAndNotificationsAPI().catch((err) => {
  console.error('Reports/Notifications Test Error:', err);
  process.exit(1);
});
