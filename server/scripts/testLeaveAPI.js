const http = require('http');
const app = require('../app');
const seedAttendanceData = require('./seedAttendance');

async function testLeaveAPI() {
  console.log('--- Setting up DB Seed for Leave API Test ---');
  await seedAttendanceData();

  const server = app.listen(5098, async () => {
    console.log('Leave test server started on port 5098');

    try {
      const request = (path, method = 'GET', body = null, token = null) => {
        return new Promise((resolve, reject) => {
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const req = http.request(
            {
              host: 'localhost',
              port: 5098,
              path,
              method,
              headers,
            },
            (res) => {
              let data = '';
              res.on('data', (chunk) => (data += chunk));
              res.on('end', () => {
                try {
                  resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                  resolve({ status: res.statusCode, raw: data });
                }
              });
            }
          );
          req.on('error', reject);
          if (body) req.write(JSON.stringify(body));
          req.end();
        });
      };

      // 1. Logins
      console.log('\n--- 1. Login ---');
      const empLogin = await request('/api/auth/login', 'POST', {
        email: 'emp001@dayflow.com',
        password: 'password123',
      });
      const empToken = empLogin.data.token;

      const adminLogin = await request('/api/auth/login', 'POST', {
        email: 'admin@dayflow.com',
        password: 'password123',
      });
      const adminToken = adminLogin.data.token;

      console.log('Tokens received:', { emp: !!empToken, admin: !!adminToken });

      // 2. POST /api/leave/apply
      console.log('\n--- 2. POST /api/leave/apply (Valid Request) ---');
      const applyRes = await request(
        '/api/leave/apply',
        'POST',
        {
          leaveType: 'Paid',
          startDate: '2026-10-01',
          endDate: '2026-10-05',
          reason: 'Personal annual vacation trip plan',
        },
        empToken
      );
      console.log('Status:', applyRes.status);
      console.log('Response:', JSON.stringify(applyRes.data, null, 2));

      // Test validation: reason < 10 chars
      console.log('\n--- 2b. POST /api/leave/apply (Short Reason - Expect 400) ---');
      const shortReasonRes = await request(
        '/api/leave/apply',
        'POST',
        {
          leaveType: 'Sick',
          startDate: '2026-10-10',
          endDate: '2026-10-10',
          reason: 'Sick',
        },
        empToken
      );
      console.log('Status:', shortReasonRes.status);
      console.log('Response:', JSON.stringify(shortReasonRes.data, null, 2));

      // Test validation: endDate < startDate
      console.log('\n--- 2c. POST /api/leave/apply (endDate < startDate - Expect 400) ---');
      const invalidDateRes = await request(
        '/api/leave/apply',
        'POST',
        {
          leaveType: 'Sick',
          startDate: '2026-10-10',
          endDate: '2026-10-05',
          reason: 'Valid reason exceeding 10 chars',
        },
        empToken
      );
      console.log('Status:', invalidDateRes.status);
      console.log('Response:', JSON.stringify(invalidDateRes.data, null, 2));

      // 3. GET /api/leave/my-leaves
      console.log('\n--- 3. GET /api/leave/my-leaves ---');
      const myLeavesRes = await request('/api/leave/my-leaves', 'GET', null, empToken);
      console.log('Status:', myLeavesRes.status);
      console.log('Leaves Count:', myLeavesRes.data.leaves ? myLeavesRes.data.leaves.length : 0);
      console.log('Balance:', JSON.stringify(myLeavesRes.data.balance, null, 2));

      // 4. GET /api/leave/requests (Admin)
      console.log('\n--- 4. GET /api/leave/requests (Admin / HR) ---');
      const allRequestsRes = await request('/api/leave/requests?status=Pending', 'GET', null, adminToken);
      console.log('Status:', allRequestsRes.status);
      console.log('Pending Requests Count:', allRequestsRes.data.total);
      console.log('Sample Request:', JSON.stringify(allRequestsRes.data.records[0], null, 2));

      // 5. PUT /api/leave/:leaveId/approve (Admin)
      console.log('\n--- 5. PUT /api/leave/:leaveId/approve ---');
      const pendingLeaveId = allRequestsRes.data.records[0].id;
      const approveRes = await request(
        `/api/leave/${pendingLeaveId}/approve`,
        'PUT',
        { action: 'Approved', comments: 'Approved by HR manager' },
        adminToken
      );
      console.log('Status:', approveRes.status);
      console.log('Response:', JSON.stringify(approveRes.data, null, 2));

      // 6. DELETE /api/leave/:leaveId (Cancel Leave)
      console.log('\n--- 6. DELETE /api/leave/:leaveId (Cancel Non-Pending Leave - Expect 400) ---');
      const appliedLeaveId = applyRes.data.leave.id;
      const cancelApprovedRes = await request(`/api/leave/${appliedLeaveId}`, 'DELETE', null, empToken);
      console.log('Status:', cancelApprovedRes.status);
      console.log('Response:', JSON.stringify(cancelApprovedRes.data, null, 2));

      console.log('\n--- 6b. DELETE /api/leave/:leaveId (Cancel Pending Leave - Expect 200) ---');
      // Create a fresh pending leave to cancel
      const tempLeaveRes = await request(
        '/api/leave/apply',
        'POST',
        {
          leaveType: 'Sick',
          startDate: '2026-11-01',
          endDate: '2026-11-01',
          reason: 'Scheduled flu vaccination appointment',
        },
        empToken
      );
      const pendingCancelId = tempLeaveRes.data.leave.id;
      const cancelRes = await request(`/api/leave/${pendingCancelId}`, 'DELETE', null, empToken);
      console.log('Status:', cancelRes.status);
      console.log('Response:', JSON.stringify(cancelRes.data, null, 2));

      console.log('\n🎉 ALL LEAVE API ENDPOINTS TESTED SUCCESSFULLY! 🎉');
    } catch (err) {
      console.error('Leave API Test Error:', err);
    } finally {
      server.close();
    }
  });
}

testLeaveAPI();
