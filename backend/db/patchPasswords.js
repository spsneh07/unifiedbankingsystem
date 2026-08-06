/**
 * One-time script: hash plaintext passwords in existing DB.
 * Run: node db/patchPasswords.js
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const PATCH_MAP = {
  'admin@nexusbank.com': 'admin',
  'customer@nexusbank.com': 'password',
  'employee@nexusbank.com': 'employee123',
};

async function patchPasswords() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'banking_db',
  });

  console.log('🔐 Patching demo user passwords to bcrypt hashes...\n');

  for (const [email, plainPassword] of Object.entries(PATCH_MAP)) {
    const [rows] = await connection.query(
      'SELECT user_id, password_hash FROM users WHERE email = ?', [email]
    );
    if (!rows.length) {
      console.log(`  ⚠ User not found: ${email}`);
      continue;
    }
    const user = rows[0];
    const alreadyHashed = user.password_hash.startsWith('$2');
    if (alreadyHashed) {
      console.log(`  ✓ Already hashed: ${email}`);
      continue;
    }
    const hash = await bcrypt.hash(plainPassword, 12);
    await connection.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [hash, user.user_id]);
    console.log(`  ✓ Patched: ${email}`);
  }

  await connection.end();
  console.log('\n✅ Password patch complete.');
}

patchPasswords().catch(err => {
  console.error('Patch failed:', err.message);
  process.exit(1);
});
