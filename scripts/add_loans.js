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
    CREATE TABLE IF NOT EXISTS loans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT,
      amount DECIMAL(15,2) NOT NULL,
      interest_rate DECIMAL(5,2) NOT NULL,
      tenure INT NOT NULL,
      emi DECIMAL(15,2) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
    )
  `);
  
  const [rows] = await connection.query('SELECT COUNT(*) as c FROM loans');
  if (rows[0].c === 0) {
    await connection.query(`
      INSERT INTO loans (customer_id, amount, interest_rate, tenure, emi, status)
      VALUES 
      (1, 100000.00, 10.5, 60, 2149.39, 'approved'),
      (1, 50000.00, 12.0, 36, 1660.72, 'pending')
    `);
  }
  
  console.log('loans table created and seeded.');
  await connection.end();
}
run().catch(console.error);
