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
    CREATE TABLE IF NOT EXISTS credit_cards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT,
      card_number VARCHAR(20) UNIQUE NOT NULL,
      limit_amount DECIMAL(15,2) DEFAULT 0.00,
      used_amount DECIMAL(15,2) DEFAULT 0.00,
      due_date DATE,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
    )
  `);
  
  const [rows] = await connection.query('SELECT COUNT(*) as c FROM credit_cards');
  if (rows[0].c === 0) {
    await connection.query(`
      INSERT INTO credit_cards (customer_id, card_number, limit_amount, used_amount, due_date)
      VALUES 
      (1, '4111-2222-3333-4444', 50000.00, 15000.00, DATE_ADD(NOW(), INTERVAL 15 DAY)),
      (1, '4555-6666-7777-8888', 100000.00, 85000.00, DATE_ADD(NOW(), INTERVAL 5 DAY))
    `);
  }
  
  console.log('credit_cards created and seeded.');
  await connection.end();
}
run().catch(console.error);
