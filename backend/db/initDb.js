const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const dbName = process.env.DB_NAME || 'banking_db';
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  await connection.query(`USE \`${dbName}\`;`);

  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      customer_id INT NULL,
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
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
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
      is_suspicious BOOLEAN DEFAULT FALSE,
      category VARCHAR(50) DEFAULT 'Other',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS branches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      address TEXT,
      code VARCHAR(50) UNIQUE,
      phone VARCHAR(20),
      manager_name VARCHAR(100),
      latitude DECIMAL(10,8),
      longitude DECIMAL(11,8)
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      branch_id INT,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      position VARCHAR(100),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      action VARCHAR(100),
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scheduled_transactions (
      schedule_id INT AUTO_INCREMENT PRIMARY KEY,
      account_id INT,
      amount DECIMAL(15,2),
      frequency VARCHAR(50),
      bill_type VARCHAR(50),
      start_date DATE,
      next_execution DATE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS loans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT,
      amount DECIMAL(15,2),
      interest_rate DECIMAL(5,2),
      tenure INT,
      emi DECIMAL(15,2),
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS credit_scores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT,
      score INT,
      loan_repayment_factor INT,
      credit_usage_factor INT,
      missed_payments_factor INT,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS credit_cards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT,
      card_number VARCHAR(20) UNIQUE,
      limit_amount DECIMAL(15,2),
      used_amount DECIMAL(15,2) DEFAULT 0,
      due_date DATE,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS alerts (
      alert_id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT,
      message TEXT,
      type VARCHAR(50),
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const statements = schema.split(';').filter(stmt => stmt.trim() !== '');
  for (const stmt of statements) {
    await connection.query(stmt);
  }

  // Seed demo data
  const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
  if (users[0].count === 0) {
    const adminHash = await bcrypt.hash('admin', 12);
    const customerHash = await bcrypt.hash('password', 12);
    const employeeHash = await bcrypt.hash('employee123', 12);
    await connection.query(`INSERT INTO users (email, password_hash, role, customer_id) VALUES ('admin@nexusbank.com', '${adminHash}', 'admin', NULL)`);
    await connection.query(`INSERT INTO users (email, password_hash, role, customer_id) VALUES ('customer@nexusbank.com', '${customerHash}', 'customer', 1)`);
    await connection.query(`INSERT INTO users (email, password_hash, role, customer_id) VALUES ('employee@nexusbank.com', '${employeeHash}', 'employee', NULL)`);

    await connection.query(`INSERT INTO customers (user_id, first_name, last_name, phone) VALUES (2, 'John', 'Doe', '555-0100')`);
    await connection.query(`INSERT INTO accounts (customer_id, account_number, type, balance) VALUES (1, 'ACC1001', 'checking', 5000.00)`);
    await connection.query(`INSERT INTO accounts (customer_id, account_number, type, balance) VALUES (1, 'ACC1002', 'savings', 12000.00)`);

    await connection.query(`INSERT INTO transactions (account_id, type, amount, description) VALUES (1, 'deposit', 5000.00, 'Initial Deposit')`);
    await connection.query(`INSERT INTO transactions (account_id, type, amount, description) VALUES (1, 'withdrawal', -500.00, 'ATM Withdrawal')`);
    await connection.query(`INSERT INTO transactions (account_id, type, amount, description) VALUES (2, 'deposit', 12000.00, 'Initial Deposit')`);

    await connection.query(`INSERT INTO branches (name, address, code, phone, latitude, longitude) VALUES ('Mumbai Main Branch', 'Nariman Point, Mumbai', 'BR001', '1800-111-222', 18.9256, 72.8242)`);
    await connection.query(`INSERT INTO branches (name, address, code, phone, latitude, longitude) VALUES ('Delhi Central', 'Connaught Place, New Delhi', 'BR002', '1800-111-223', 28.6315, 77.2167)`);
    await connection.query(`INSERT INTO branches (name, address, code, phone, latitude, longitude) VALUES ('Bangalore Tech Hub', 'Koramangala, Bangalore', 'BR003', '1800-111-224', 12.9352, 77.6245)`);
    await connection.query(`INSERT INTO branches (name, address, code, phone, latitude, longitude) VALUES ('Chennai Coastal', 'Marina Beach Rd, Chennai', 'BR004', '1800-111-225', 13.0500, 80.2824)`);
    await connection.query(`INSERT INTO branches (name, address, code, phone, latitude, longitude) VALUES ('Kolkata Heritage', 'Park Street, Kolkata', 'BR005', '1800-111-226', 22.5529, 88.3527)`);
    await connection.query(`INSERT INTO branches (name, address, code, phone, latitude, longitude) VALUES ('Hyderabad Cyber', 'HITEC City, Hyderabad', 'BR006', '1800-111-227', 17.4435, 78.3772)`);
    await connection.query(`INSERT INTO branches (name, address, code, phone, latitude, longitude) VALUES ('Pune Deccan', 'Deccan Gymkhana, Pune', 'BR007', '1800-111-228', 18.5167, 73.8400)`);
    await connection.query(`INSERT INTO branches (name, address, code, phone, latitude, longitude) VALUES ('Ahmedabad Commerce', 'Navrangpura, Ahmedabad', 'BR008', '1800-111-229', 23.0365, 72.5611)`);
    await connection.query(`INSERT INTO branches (name, address, code, phone, latitude, longitude) VALUES ('Jaipur Pink City', 'MI Road, Jaipur', 'BR009', '1800-111-230', 26.9124, 75.7873)`);
    await connection.query(`INSERT INTO employees (user_id, branch_id, first_name, last_name, position) VALUES (3, 1, 'Sarah', 'Smith', 'Teller')`);
  }

  await connection.end();
  console.log('Database initialized successfully.');
}

initDb().catch(console.error);
