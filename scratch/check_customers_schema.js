const mysql = require('mysql2/promise');

async function check() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Sneh@1234',
      database: 'banking_db'
    });
    const [rows] = await conn.execute('DESCRIBE customers');
    console.log('Customers Schema:', rows);
    await conn.end();
  } catch (err) {
    console.error('Check Error:', err.message);
  }
}

check();
