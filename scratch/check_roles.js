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
    const [rows] = await conn.execute('SELECT DISTINCT role FROM users');
    console.log('Roles in DB:', rows);
    await conn.end();
  } catch (err) {
    console.error('Check Error:', err.message);
  }
}

check();
