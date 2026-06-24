const { PrismaClient } = require('@prisma/client');

async function runVerification() {
  console.log('=== STARTING E2E CUSTOM DEPARTMENT FLOW VERIFICATION ===');
  const prisma = new PrismaClient();

  const employeeEmail = `custom.dept.${Date.now()}@amdox.com`;
  const customDeptName = `Innovation Lab ${Date.now()}`;

  try {
    // 1. Clean up any previous test users with the same email if exists
    await prisma.user.deleteMany({
      where: { email: employeeEmail }
    });

    console.log(`\n1. Registering new employee with custom department: "${customDeptName}"`);
    const registerResponse = await fetch('http://127.0.0.1:5000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Innovation',
        lastName: 'Developer',
        email: employeeEmail,
        password: 'Password123!',
        companyName: 'Amdox Technologies',
        departmentName: customDeptName,
        isNewDepartmentRequest: true,
        roleId: 3, // Employee
      })
    });

    if (!registerResponse.ok) {
      const errText = await registerResponse.text();
      throw new Error(`Registration failed: ${errText}`);
    }
    const registerData = await registerResponse.json();
    console.log('Registration response:', registerData);

    // 2. Fetch the OTP from the database and verify
    console.log('\n2. Retrieving OTP from database for email verification...');
    const verificationRecord = await prisma.emailVerification.findFirst({
      where: { email: employeeEmail },
      orderBy: { created_at: 'desc' }
    });

    if (!verificationRecord) {
      throw new Error('Verification OTP record not found in database.');
    }
    const otpCode = verificationRecord.otp_code;
    console.log(`Retrieved OTP: ${otpCode}. Verifying OTP...`);

    const verifyResponse = await fetch('http://127.0.0.1:5000/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: employeeEmail,
        otp: otpCode,
        purpose: 'registration'
      })
    });

    if (!verifyResponse.ok) {
      const errText = await verifyResponse.text();
      throw new Error(`OTP Verification failed: ${errText}`);
    }
    console.log('OTP verified successfully!');

    // Verify user is created but has department_id: null initially
    const registeredUserBeforeApproval = await prisma.user.findUnique({
      where: { email: employeeEmail },
      include: { department: true }
    });
    console.log('User department before approval:', registeredUserBeforeApproval.department);
    if (registeredUserBeforeApproval.department_id !== null) {
      throw new Error('User department_id should be null before approval.');
    }

    // 3. Log in as CEO
    console.log('\n3. Logging in as CEO to fetch requests...');
    const loginResponse = await fetch('http://127.0.0.1:5000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ceo@amdox.com',
        password: 'Password123!'
      })
    });

    if (!loginResponse.ok) {
      const errText = await loginResponse.text();
      throw new Error(`CEO login failed: ${errText}`);
    }
    const loginData = await loginResponse.json();
    const ceoToken = loginData.accessToken;
    console.log('CEO logged in. Token acquired.');

    // 4. Fetch pending department requests
    console.log('\n4. Fetching pending department requests for CEO...');
    const requestsResponse = await fetch('http://127.0.0.1:5000/dashboard/department-requests', {
      headers: { 'Authorization': `Bearer ${ceoToken}` }
    });

    if (!requestsResponse.ok) {
      const errText = await requestsResponse.text();
      throw new Error(`Failed to fetch department requests: ${errText}`);
    }
    const requestsList = await requestsResponse.json();
    console.log('Pending requests list:', requestsList);

    const matchingRequest = requestsList.find(r => r.departmentName === customDeptName);
    if (!matchingRequest) {
      throw new Error(`Could not find the pending request for department "${customDeptName}"`);
    }
    console.log(`Found matching request! ID: ${matchingRequest.requestId}`);

    // 5. Approve the request as CEO
    console.log(`\n5. Approving the request ID: ${matchingRequest.requestId}...`);
    const approveResponse = await fetch(`http://127.0.0.1:5000/dashboard/department-requests/${matchingRequest.requestId}/approve`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${ceoToken}`,
        'Content-Type': 'application/json' 
      }
    });

    if (!approveResponse.ok) {
      const errText = await approveResponse.text();
      throw new Error(`Approval failed: ${errText}`);
    }
    const approveData = await approveResponse.json();
    console.log('Approval response:', approveData);

    // 6. Verify database updates
    console.log('\n6. Checking database updates for user and department...');
    const updatedUser = await prisma.user.findUnique({
      where: { email: employeeEmail },
      include: { department: true }
    });

    if (!updatedUser.department_id) {
      throw new Error('User department_id is still null after CEO approval!');
    }
    console.log(`User is now linked to department ID: ${updatedUser.department_id}`);
    console.log('Associated Department:', updatedUser.department);

    if (updatedUser.department.department_name !== customDeptName) {
      throw new Error(`Expected department name "${customDeptName}" but got "${updatedUser.department.department_name}"`);
    }

    console.log('\n=== E2E FLOW VERIFICATION COMPLETED SUCCESSFULLY ===');
    console.log('All assertions passed. Custom department creation and link updates are fully functional!');

  } catch (error) {
    console.error('\n!!! VERIFICATION FAILED !!!');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
