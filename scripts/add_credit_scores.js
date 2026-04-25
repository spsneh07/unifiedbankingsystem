const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'banking_db',
  });

  await connection.query(`
    CREATE TABLE IF NOT EXISTS credit_scores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT UNIQUE NOT NULL,
      score INT NOT NULL DEFAULT 700,
      loan_repayment_factor INT DEFAULT 0,
      credit_usage_factor INT DEFAULT 0,
      missed_payments_factor INT DEFAULT 0,
      last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
    )
  `);

  // Seed a score for customer 1
  await connection.query(`
    INSERT IGNORE INTO credit_scores (customer_id, score, loan_repayment_factor, credit_usage_factor, missed_payments_factor)
    VALUES (1, 720, 40, -15, -5)
  `);

  console.log('credit_scores table created and seeded.');
  await connection.end();
}
run().catch(console.error);
