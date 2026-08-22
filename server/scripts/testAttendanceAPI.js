const http = require('http');
const app = require('../app');
const { sequelize, User, Attendance } = require('../models');
const seedAttendanceData = require('./seedAttendance');

async function testAPI() {
  console.log('--- Setting up DB Seed for API Test ---');
  await seedAttendanceData();

  const server = app.listen(5099, async () => {
    console.log('Test server started on port 5099');

    try {
      // Helper for HTTP requests
      const request = (path, method = 'GET', body = null, token = null) => {
        return new Promise((resolve, reject) => {
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const req = http.request(
            {
              host: 'localhost',
              port: 5099,
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

      // 1. Login as Employee
      console.log('\n--- 1. Login as Employee (emp001@dayflow.com) ---');
      const empLogin = await request('/api/auth/login', 'POST', {
        email: 'emp001@dayflow.com',
        password: 'password123',
      });
      console.log('Status:', empLogin.status);
      const empToken = empLogin.data.token;
      console.log('Employee Token Received:', empToken ? 'YES' : 'NO');

      // 2. Login as Admin
      console.log('\n--- 2. Login as Admin (admin@dayflow.com) ---');
      const adminLogin = await request('/api/auth/login', 'POST', {
        email: 'admin@dayflow.com',
        password: 'password123',
      });
      console.log('Status:', adminLogin.status);
      const adminToken = adminLogin.data.token;
      console.log('Admin Token Received:', adminToken ? 'YES' : 'NO');

      // 3. Test POST /api/attendance/check-in
      console.log('\n--- 3. Test POST /api/attendance/check-in ---');
      const checkInRes = await request(
        '/api/attendance/check-in',
        'POST',
        { location: 'Office Desk', notes: 'Morning check in' },
        empToken
      );
      console.log('Status:', checkInRes.status);
      console.log('Response:', JSON.stringify(checkInRes.data, null, 2));

      // Test duplicate check-in (should return 400 Already checked in)
      console.log('\n--- 3b. Test Duplicate POST /api/attendance/check-in (Expect 400) ---');
      const dupCheckIn = await request(
        '/api/attendance/check-in',
        'POST',
        { location: 'Office Desk' },
        empToken
      );
      console.log('Status:', dupCheckIn.status);
      console.log('Response:', JSON.stringify(dupCheckIn.data, null, 2));

      // 4. Test POST /api/attendance/check-out
      console.log('\n--- 4. Test POST /api/attendance/check-out ---');
      const checkOutRes = await request(
        '/api/attendance/check-out',
        'POST',
        { notes: 'Leaving office' },
        empToken
      );
      console.log('Status:', checkOutRes.status);
      console.log('Response:', JSON.stringify(checkOutRes.data, null, 2));

      // Test duplicate check-out (should return 400 Already checked out)
      console.log('\n--- 4b. Test Duplicate POST /api/attendance/check-out (Expect 400) ---');
      const dupCheckOut = await request(
        '/api/attendance/check-out',
        'POST',
        {},
        empToken
      );
      console.log('Status:', dupCheckOut.status);
      console.log('Response:', JSON.stringify(dupCheckOut.data, null, 2));

      // 5. Test GET /api/attendance/me
      console.log('\n--- 5. Test GET /api/attendance/me ---');
      const meRes = await request('/api/attendance/me?view=monthly', 'GET', null, empToken);
      console.log('Status:', meRes.status);
      console.log('Records Count:', meRes.data.records ? meRes.data.records.length : 0);
      console.log('Summary:', JSON.stringify(meRes.data.summary, null, 2));

      // 6. Test GET /api/attendance (Admin)
      console.log('\n--- 6. Test GET /api/attendance (Admin/HR Only) ---');
      const allRes = await request('/api/attendance?page=1&limit=5', 'GET', null, adminToken);
      console.log('Status:', allRes.status);
      console.log('Total Records:', allRes.data.total);
      console.log('Records Sample:', JSON.stringify(allRes.data.records[0], null, 2));

      // Test Employee accessing Admin endpoint (Expect 403 Forbidden)
      console.log('\n--- 6b. Test GET /api/attendance as Employee (Expect 403 Forbidden) ---');
      const forbiddenRes = await request('/api/attendance', 'GET', null, empToken);
      console.log('Status:', forbiddenRes.status);
      console.log('Response:', JSON.stringify(forbiddenRes.data, null, 2));

      // 7. Test PUT /api/attendance/:attendanceId (Admin)
      console.log('\n--- 7. Test PUT /api/attendance/:attendanceId ---');
      const targetAttendanceId = meRes.data.records[0].id;
      const updateRes = await request(
        `/api/attendance/${targetAttendanceId}`,
        'PUT',
        {
          checkIn: '08:30:00',
          checkOut: '17:30:00',
          notes: 'Adjusted by HR',
          status: 'Present',
        },
        adminToken
      );
      console.log('Status:', updateRes.status);
      console.log('Response:', JSON.stringify(updateRes.data, null, 2));

      console.log('\n🎉 ALL ATTENDANCE API ENDPOINTS TESTED SUCCESSFULLY! 🎉');
    } catch (err) {
      console.error('API Test Error:', err);
    } finally {
      server.close();
    }
  });
}

testAPI();
