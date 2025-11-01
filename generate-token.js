// Simple script to generate a JWT token for testing
const jwt = require('jsonwebtoken');

// Use the same secret as in your backend .env file
const JWT_SECRET = '76f9ad7a2804abf2d6cbf09f15ac93da3f99aa850e9418510d088ed9601799d1';

// Create a test user object
const user = {
  userId: 1,
  email: 'test@example.com'
};

// Generate token
const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

console.log('Generated JWT Token:');
console.log(token);
console.log('\nUser object:');
console.log(JSON.stringify(user, null, 2));

console.log('\nTo use this token:');
console.log('1. Open your browser DevTools (F12)');
console.log('2. Go to Application/Storage tab');
console.log('3. Find Local Storage -> http://localhost:5173');
console.log('4. Add a new key "token" with the above value');
console.log('5. Add a new key "userData" with value:');
console.log(JSON.stringify({
  id: 1,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  campusVerified: true,
  profileComplete: false
}, null, 2));
console.log('6. Refresh the page and you should be logged in');