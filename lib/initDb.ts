import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

export async function initDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'banking_db'}\`;`);
  await connection.query(`USE \`${process.env.DB_NAME || 'banking_db'}\`;`);

  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      token VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_password_resets_email (email),
      INDEX idx_password_resets_token (token)
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      phone VARCHAR(20),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT,
      account_number VARCHAR(50) UNIQUE NOT NULL,
      type VARCHAR(50),
      balance DECIMAL(15,2) DEFAULT 0.00,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      account_id INT,
      type VARCHAR(50),
      amount DECIMAL(15,2),
      description TEXT,
      status VARCHAR(20) DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS branches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      address TEXT,
      code VARCHAR(50) UNIQUE
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      branch_id INT,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      position VARCHAR(100),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
    );
  `;

  const statements = schema.split(';').filter(stmt => stmt.trim() !== '');
  for (const stmt of statements) {
    await connection.query(stmt);
  }

  try {
    await connection.query('ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL');
  } catch {}

  // Insert mock data if empty
  const [users]: any = await connection.query('SELECT COUNT(*) as count FROM users');
  if (users[0].count === 0) {
    await connection.query(`INSERT INTO users (email, password, role) VALUES ('admin@nexusbank.com', 'admin', 'admin')`);
    await connection.query(`INSERT INTO users (email, password, role) VALUES ('customer@nexusbank.com', 'password', 'user')`);
    
    await connection.query(`INSERT INTO customers (user_id, first_name, last_name, phone) VALUES (2, 'John', 'Doe', '555-0100')`);
    await connection.query(`INSERT INTO accounts (customer_id, account_number, type, balance) VALUES (1, 'ACC1001', 'checking', 5000.00)`);
    await connection.query(`INSERT INTO accounts (customer_id, account_number, type, balance) VALUES (1, 'ACC1002', 'savings', 12000.00)`);
    
    await connection.query(`INSERT INTO transactions (account_id, type, amount, description) VALUES (1, 'deposit', 5000.00, 'Initial Deposit')`);
    await connection.query(`INSERT INTO transactions (account_id, type, amount, description) VALUES (1, 'withdrawal', -500.00, 'ATM Withdrawal')`);
    await connection.query(`INSERT INTO transactions (account_id, type, amount, description) VALUES (2, 'deposit', 12000.00, 'Initial Deposit')`);
  }

  await connection.end();
  console.log('Database initialized successfully.');
}

initDb().catch(console.error);
