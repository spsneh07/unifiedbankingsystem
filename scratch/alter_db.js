
const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Sneh@1234',
    database: 'banking_db'
  });
  await conn.query(`
    ALTER TABLE transactions 
    MODIFY category ENUM(
      'Food','Travel','Shopping','Bills',
      'Entertainment','Healthcare','Salary','Other',
      'Transfer','Deposit','Withdraw'
    )
  `);
  console.log('Table altered successfully');
  await conn.end();
}
run().catch(console.error);
