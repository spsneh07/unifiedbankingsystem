const mysql = require('mysql2/promise');

async function check() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'banking_db'
    });
    const [rows] = await conn.execute('SELECT COUNT(*) as count FROM branches');
    console.log('Branch Count:', rows[0].count);
    await conn.end();
  } catch (err) {
    console.error('Check Error:', err.message);
  }
}

check();
