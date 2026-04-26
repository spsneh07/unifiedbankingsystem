const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'banking_db',
  });

  const [cols] = await conn.query('DESCRIBE users');
  console.log('users columns:', JSON.stringify(cols.map(c => c.Field), null, 2));

  await conn.end();
})().catch(console.error);
