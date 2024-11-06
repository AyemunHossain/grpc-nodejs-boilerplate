require('dotenv').config();
const jwt = require('jsonwebtoken');

const payload = {
  userId: 1,
  username: 'testuser'
};

const secret = process.env.JWT_SECRET;
const options = {
  expiresIn: '24h' // Token expires in 1 hour
};

const token = jwt.sign(payload, secret, options);

// verify the token
const decoded = jwt.verify(token, secret);
console.log('Generated JWT:', token);
console.log('Decoded JWT:', decoded);
