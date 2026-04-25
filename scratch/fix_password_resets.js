
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function fixTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'banking_db',
  });

  console.log('Creating password_resets table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      token VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_password_resets_email (email),
      INDEX idx_password_resets_token (token)
    );
  `);

  await connection.end();
  console.log('Done.');
}

fixTable().catch(console.error);
