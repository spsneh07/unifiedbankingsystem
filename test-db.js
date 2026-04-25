require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'banking_db',
  });
  
  const [users] = await pool.query('DESCRIBE users');
  const [customers] = await pool.query('DESCRIBE customers');
  console.log('users schema:', users);
  console.log('customers schema:', customers);
  process.exit(0);
}
main();
