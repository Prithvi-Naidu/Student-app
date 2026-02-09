console.log('1. Starting...');
require('dotenv').config();
console.log('2. Dotenv loaded');

console.log('3. About to import database config');
const pool = require('./src/config/database').default;
console.log('4. Database config imported');

console.log('5. About to import redis');
const { connectRedis } = require('./src/config/redis');
console.log('6. Redis imported');

console.log('7. About to connect to Redis');
connectRedis().then(() => {
  console.log('8. Redis connected!');
  process.exit(0);
}).catch((err) => {
  console.log('8. Redis failed:', err.message);
  process.exit(1);
});

setTimeout(() => {
  console.log('TIMEOUT: Process hung somewhere');
  process.exit(1);
}, 5000);
