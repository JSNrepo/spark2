// Database schema test - run this in browser console to check table structure
console.log('Testing database schema...');

// Test users table
fetch('/rest/v1/users?select=id,email,role&limit=1', {
  headers: {
    'apikey': 'your-anon-key',
    'Authorization': 'Bearer your-anon-key'
  }
}).then(r => r.json()).then(d => console.log('users table:', d));

// Test parking_lots table structure
fetch('/rest/v1/parking_lots?select=id,name,providerId&limit=1', {
  headers: {
    'apikey': 'your-anon-key', 
    'Authorization': 'Bearer your-anon-key'
  }
}).then(r => r.json()).then(d => console.log('parking_lots table:', d));
