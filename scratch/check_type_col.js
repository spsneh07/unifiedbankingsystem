
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkColumnDefinition() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'banking_db',
  });

  console.log('--- transactions columns definition ---');
  const [rows] = await connection.query("SHOW FULL COLUMNS FROM transactions WHERE Field = 'type'");
  console.log(JSON.stringify(rows, null, 2));

  await connection.end();
}

checkColumnDefinition().catch(console.error);
