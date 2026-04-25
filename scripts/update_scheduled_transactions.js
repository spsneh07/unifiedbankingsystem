const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'banking_db',
  });
  
  try {
    await connection.query('ALTER TABLE scheduled_transactions ADD COLUMN bill_type VARCHAR(50) DEFAULT "other"');
    console.log('Added bill_type column');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('bill_type already exists');
    else throw e;
  }
  
  const [data] = await connection.query('SELECT * FROM scheduled_transactions');
  if (data.length === 0) {
    await connection.query(`
      INSERT INTO scheduled_transactions (account_id, amount, frequency, next_execution, is_active, bill_type)
      VALUES (1, 1500.00, 'monthly', DATE_SUB(NOW(), INTERVAL 1 DAY), 1, 'electricity'),
             (1, 12000.00, 'monthly', DATE_ADD(NOW(), INTERVAL 5 DAY), 1, 'rent')
    `);
    console.log('Seeded data');
  }

  await connection.end();
}

run().catch(console.error);
