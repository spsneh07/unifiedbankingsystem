-- Supabase PostgreSQL Seed Data for NexusBank

-- Note: Passwords below are hashed. 
-- Admin: admin
-- Customer: password
-- Employee: employee123

INSERT INTO users (user_id, email, password_hash, role, customer_id) VALUES 
(1, 'admin@nexusbank.com', '$2b$12$c.njhOqOhOjn9iTjpDLVBOb7oQt.p749DirIwRO4qoBe1SKRN3cOK', 'admin', NULL),
(2, 'customer@nexusbank.com', '$2b$12$EvNM1Nh/VFgcm9yzZDFS9.EmEP9/15lD6i4Ko2jUo7m2S/4KTxydi', 'customer', 1),
(3, 'employee@nexusbank.com', '$2b$12$mVLz.TIGZ4hIK.h1kULNIuN6tAEVDO5oIFSjpH.XFE.IkpEnZ.P1S', 'employee', NULL);

INSERT INTO customers (id, user_id, first_name, last_name, phone) VALUES 
(1, 2, 'John', 'Doe', '555-0100');

INSERT INTO accounts (id, customer_id, account_number, type, balance) VALUES 
(1, 1, 'ACC1001', 'checking', 5000.00),
(2, 1, 'ACC1002', 'savings', 12000.00);

INSERT INTO transactions (account_id, type, amount, description) VALUES 
(1, 'deposit', 5000.00, 'Initial Deposit'),
(1, 'withdrawal', -500.00, 'ATM Withdrawal'),
(2, 'deposit', 12000.00, 'Initial Deposit');

INSERT INTO branches (id, name, address, code, phone, latitude, longitude) VALUES 
(1, 'Mumbai Main Branch', 'Nariman Point, Mumbai', 'BR001', '1800-111-222', 18.9256, 72.8242),
(2, 'Delhi Central', 'Connaught Place, New Delhi', 'BR002', '1800-111-223', 28.6315, 77.2167),
(3, 'Bangalore Tech Hub', 'Koramangala, Bangalore', 'BR003', '1800-111-224', 12.9352, 77.6245),
(4, 'Chennai Coastal', 'Marina Beach Rd, Chennai', 'BR004', '1800-111-225', 13.0500, 80.2824);

INSERT INTO employees (id, user_id, branch_id, first_name, last_name, position) VALUES 
(1, 3, 1, 'Sarah', 'Smith', 'Teller');

-- Reset sequences (very important for PostgreSQL when explicit IDs are inserted)
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers));
SELECT setval('accounts_id_seq', (SELECT MAX(id) FROM accounts));
SELECT setval('transactions_id_seq', (SELECT MAX(id) FROM transactions));
SELECT setval('branches_id_seq', (SELECT MAX(id) FROM branches));
SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees));
