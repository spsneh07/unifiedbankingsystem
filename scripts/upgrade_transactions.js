const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function upgrade() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'banking_db',
  });

  try {
    console.log('Altering transactions table...');
    // We add status and reference_id. Make status default to 'SUCCESS' for old ones?
    await pool.query(`
      ALTER TABLE transactions 
      ADD COLUMN status ENUM('PENDING', 'SUCCESS', 'FAILED', 'SUSPICIOUS') DEFAULT 'SUCCESS',
      ADD COLUMN reference_id VARCHAR(100) NULL
    `).catch(e => console.log('Columns might already exist:', e.message));

    console.log('Creating audit_logs table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);

    console.log('Upgrade successful!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

upgrade();
