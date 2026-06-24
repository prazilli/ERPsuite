const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/hrms/employees/2/leaves',
  method: 'GET',
  headers: {
    // I need the JWT token or I can just mock the user in the backend. 
    // Since I don't have the token, I will query the DB directly in another script. But wait, I already did that.
  }
};
