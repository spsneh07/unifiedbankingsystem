-- Supabase PostgreSQL Schema for NexusBank

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  customer_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_password_resets_email ON password_resets(email);
CREATE INDEX idx_password_resets_token ON password_resets(token);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  user_id INT,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  customer_id INT,
  account_number VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(50),
  balance DECIMAL(15,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
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
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  address TEXT,
  code VARCHAR(50) UNIQUE,
  phone VARCHAR(20),
  manager_name VARCHAR(100),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8)
);

CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  user_id INT,
  branch_id INT,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  position VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT,
  action VARCHAR(100),
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scheduled_transactions (
  schedule_id SERIAL PRIMARY KEY,
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
  id SERIAL PRIMARY KEY,
  customer_id INT,
  amount DECIMAL(15,2),
  interest_rate DECIMAL(5,2),
  tenure INT,
  emi DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS credit_scores (
  id SERIAL PRIMARY KEY,
  customer_id INT,
  score INT,
  loan_repayment_factor INT,
  credit_usage_factor INT,
  missed_payments_factor INT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS credit_cards (
  id SERIAL PRIMARY KEY,
  customer_id INT,
  card_number VARCHAR(20) UNIQUE,
  limit_amount DECIMAL(15,2),
  used_amount DECIMAL(15,2) DEFAULT 0,
  due_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
  alert_id SERIAL PRIMARY KEY,
  customer_id INT,
  message TEXT,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
