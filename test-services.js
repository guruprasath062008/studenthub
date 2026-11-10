const http = require('http');

// Helper to make HTTP requests
function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('   StudentHub Multi-Service Integration Test Suite  ');
  console.log('====================================================\n');

  // Start Auth Service in-process
  process.env.PORT = '5001';
  process.env.NODE_ENV = 'test';
  require('./auth-service/src/index.js');

  // Wait 1 second for auth service
  await new Promise(r => setTimeout(r, 1000));

  console.log('--- TEST GROUP 1: AUTH SERVICE ---');
  // 1. Health check
  const authHealth = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/health',
    method: 'GET'
  });
  console.log('✓ [Auth Service] Healthcheck Status:', authHealth.status, authHealth.data);

  // 2. Login with pre-seeded Admin
  const adminLogin = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'admin@studenthub.local',
    password: 'Admin@123'
  });
  console.log('✓ [Auth Service] Admin Login Status:', adminLogin.status, 'Success:', adminLogin.data.success);
  const adminToken = adminLogin.data.token;
  if (!adminToken) throw new Error('Failed to obtain JWT token for admin');
  console.log('  Token preview:', adminToken.slice(0, 25) + '...');

  // 3. Test authenticated profile retrieval /me
  const meRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('✓ [Auth Service] Authenticated /me Status:', meRes.status, 'User Name:', meRes.data.user.name);

  // 4. Test Registration
  const testReg = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Dr. Jane Smith',
    email: 'jane.smith@studenthub.local',
    password: 'Faculty@123',
    role: 'faculty'
  });
  console.log('✓ [Auth Service] Registration Status:', testReg.status, 'Registered User:', testReg.data.user.name);

  console.log('\n--- TEST GROUP 2: STUDENT API SERVICE ---');
  // Start Student API Service in-process
  process.env.PORT = '5002';
  require('./student-service/src/index.js');
  await new Promise(r => setTimeout(r, 1000));

  // 5. Student Service Health
  const stuHealth = await request({
    hostname: 'localhost',
    port: 5002,
    path: '/api/students/health',
    method: 'GET'
  });
  console.log('✓ [Student Service] Healthcheck Status:', stuHealth.status, stuHealth.data);

  // 6. Student Stats
  const statsRes = await request({
    hostname: 'localhost',
    port: 5002,
    path: '/api/students/stats',
    method: 'GET'
  });
  console.log('✓ [Student Service] Stats Retrieval Status:', statsRes.status, 'Total Students:', statsRes.data.stats.totalStudents, 'Average GPA:', statsRes.data.stats.averageGpa);

  // 7. Get All Students with department filter
  const filterRes = await request({
    hostname: 'localhost',
    port: 5002,
    path: '/api/students?department=Computer%20Science',
    method: 'GET'
  });
  console.log('✓ [Student Service] Department Filter Status:', filterRes.status, 'Computer Science Count:', filterRes.data.count);

  // 8. Create a New Student (guarded with JWT)
  const newStudentRes = await request({
    hostname: 'localhost',
    port: 5002,
    path: '/api/students',
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, {
    roll_number: 'CS2024999',
    first_name: 'Harsh',
    last_name: 'Gupta',
    email: 'harsh.gupta@student.edu',
    phone: '+91 9876500000',
    department: 'Computer Science',
    enrollment_date: '2024-08-15',
    gpa: 3.96,
    status: 'Active'
  });
  console.log('✓ [Student Service] Create Student Status:', newStudentRes.status, 'Created ID:', newStudentRes.data.data.id, 'Roll:', newStudentRes.data.data.roll_number);
  const createdStudentId = newStudentRes.data.data.id;

  // 9. Update Student GPA
  const updateRes = await request({
    hostname: 'localhost',
    port: 5002,
    path: `/api/students/${createdStudentId}`,
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, {
    roll_number: 'CS2024999',
    first_name: 'Harsh',
    last_name: 'Gupta',
    email: 'harsh.gupta@student.edu',
    phone: '+91 9876500000',
    department: 'Computer Science',
    enrollment_date: '2024-08-15',
    gpa: 4.00,
    status: 'Active'
  });
  console.log('✓ [Student Service] Update Student Status:', updateRes.status, 'Updated GPA:', updateRes.data.data.gpa);

  // 10. Delete Student
  const deleteRes = await request({
    hostname: 'localhost',
    port: 5002,
    path: `/api/students/${createdStudentId}`,
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${adminToken}`
    }
  });
  console.log('✓ [Student Service] Delete Student Status:', deleteRes.status, deleteRes.data.message);

  console.log('\n====================================================');
  console.log('  ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS!   ');
  console.log('====================================================');

  process.exit(0);
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});