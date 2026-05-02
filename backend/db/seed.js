const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'banking_db',
  });

  console.log('🌱 Seeding demo data...\n');

  // ─── 1. MORE CUSTOMERS ───
  console.log('👤 Creating customers...');
  const customers = [
    [2, 'John', 'Doe', '555-0100', 'Andheri West, Mumbai'],
    [null, 'Priya', 'Sharma', '555-0101', 'Koramangala, Bangalore'],
    [null, 'Rahul', 'Patel', '555-0102', 'Connaught Place, Delhi'],
    [null, 'Sneha', 'Gupta', '555-0103', 'Salt Lake, Kolkata'],
    [null, 'Amit', 'Verma', '555-0104', 'Banjara Hills, Hyderabad'],
  ];

  // Check existing customers
  const [existingCustomers] = await connection.query('SELECT COUNT(*) as cnt FROM customers');
  if (existingCustomers[0].cnt < 5) {
    for (const c of customers) {
      try {
        await connection.query(
          'INSERT IGNORE INTO customers (user_id, first_name, last_name, phone, address) VALUES (?, ?, ?, ?, ?)', c
        );
      } catch (e) {}
    }
  }
  const [allCustomers] = await connection.query('SELECT id FROM customers ORDER BY id');
  console.log(`   ✓ ${allCustomers.length} customers ready\n`);

  // ─── 2. ACCOUNTS ───
  console.log('🏦 Creating accounts...');
  const accountTypes = ['Savings', 'Checking', 'Savings', 'Checking', 'Savings'];
  const balances = [85000, 42000, 156000, 23500, 310000, 67000, 12500, 95000];
  let accIdx = 0;

  for (const cust of allCustomers) {
    const [existing] = await connection.query('SELECT COUNT(*) as cnt FROM accounts WHERE customer_id = ?', [cust.id]);
    const need = 2 - existing[0].cnt; // Ensure at least 2 accounts per customer
    for (let i = 0; i < need; i++) {
      const accNo = 'ACC' + Math.floor(1000000000 + Math.random() * 9000000000);
      const type = accountTypes[accIdx % accountTypes.length];
      const bal = balances[accIdx % balances.length];
      await connection.query(
        'INSERT INTO accounts (customer_id, account_number, type, balance, status) VALUES (?, ?, ?, ?, ?)',
        [cust.id, accNo, type, bal, 'Active']
      );
      accIdx++;
    }
  }

  const [allAccounts] = await connection.query('SELECT id, customer_id, balance FROM accounts ORDER BY id');
  console.log(`   ✓ ${allAccounts.length} accounts ready\n`);

  // ─── 3. TRANSACTIONS ───
  console.log('💸 Creating transactions...');
  const txTypes = ['Deposit', 'Withdrawal', 'Transfer', 'Deposit', 'Withdrawal', 'Deposit'];
  const txCategories = ['Salary', 'Shopping', 'Transfer', 'Deposit', 'Bills', 'Food', 'Travel', 'Entertainment', 'Healthcare'];
  const txDescs = [
    'Monthly salary credit', 'Amazon purchase', 'Rent payment', 'Freelance income',
    'Electricity bill', 'Swiggy order', 'Flight tickets to Goa', 'Netflix subscription',
    'Gym membership', 'Grocery shopping at DMart', 'UPI transfer to friend',
    'Mutual fund SIP', 'Insurance premium', 'Petrol filling', 'Restaurant dinner',
    'Mobile recharge', 'Water bill payment', 'Book purchase', 'Medical checkup',
    'Birthday gift purchase', 'Movie tickets', 'Uber ride', 'Train ticket booking'
  ];

  const [existingTx] = await connection.query('SELECT COUNT(*) as cnt FROM transactions');
  if (existingTx[0].cnt < 30) {
    for (const acc of allAccounts) {
      const txCount = 5 + Math.floor(Math.random() * 8); // 5-12 transactions per account
      for (let i = 0; i < txCount; i++) {
        const type = txTypes[Math.floor(Math.random() * txTypes.length)];
        const cat = txCategories[Math.floor(Math.random() * txCategories.length)];
        const desc = txDescs[Math.floor(Math.random() * txDescs.length)];
        const amount = type === 'Deposit'
          ? (5000 + Math.floor(Math.random() * 45000))
          : (200 + Math.floor(Math.random() * 15000));
        const isSuspicious = amount > 40000 ? 1 : 0;
        const daysAgo = Math.floor(Math.random() * 90);
        const date = new Date(Date.now() - daysAgo * 86400000);

        await connection.query(
          `INSERT INTO transactions (account_id, type, amount, description, status, is_suspicious, category, created_at) 
           VALUES (?, ?, ?, ?, 'SUCCESS', ?, ?, ?)`,
          [acc.id, type, amount, desc, isSuspicious, cat, date]
        );
      }
    }
  }
  const [txCount] = await connection.query('SELECT COUNT(*) as cnt FROM transactions');
  console.log(`   ✓ ${txCount[0].cnt} transactions ready\n`);

  // ─── 4. LOANS ───
  console.log('🏠 Creating loans...');
  const loanStatuses = ['approved', 'pending', 'rejected', 'approved', 'approved'];
  const [existingLoans] = await connection.query('SELECT COUNT(*) as cnt FROM loans');
  if (existingLoans[0].cnt < 5) {
    for (let i = 0; i < allCustomers.length; i++) {
      const amount = 100000 + Math.floor(Math.random() * 900000);
      const rate = 8 + Math.random() * 6;
      const tenure = [12, 24, 36, 48, 60][Math.floor(Math.random() * 5)];
      const P = amount;
      const R = (rate / 100) / 12;
      const N = tenure;
      const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
      const status = loanStatuses[i % loanStatuses.length];

      await connection.query(
        'INSERT INTO loans (customer_id, amount, interest_rate, tenure, emi, status) VALUES (?, ?, ?, ?, ?, ?)',
        [allCustomers[i].id, amount, rate.toFixed(2), tenure, emi.toFixed(2), status]
      );
    }
  }
  const [loanCount] = await connection.query('SELECT COUNT(*) as cnt FROM loans');
  console.log(`   ✓ ${loanCount[0].cnt} loans ready\n`);

  // ─── 5. CREDIT CARDS ───
  console.log('💳 Creating credit cards...');
  const [existingCards] = await connection.query('SELECT COUNT(*) as cnt FROM credit_cards');
  if (existingCards[0].cnt < 3) {
    for (const cust of allCustomers) {
      const cardNum = Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000)).join(' ');
      const limit = [50000, 100000, 200000, 75000, 150000][Math.floor(Math.random() * 5)];
      const used = Math.floor(Math.random() * limit * 0.7);
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 1);

      await connection.query(
        'INSERT INTO credit_cards (customer_id, card_number, limit_amount, used_amount, due_date, status) VALUES (?, ?, ?, ?, ?, ?)',
        [cust.id, cardNum, limit, used, dueDate, 'active']
      );
    }
  }
  const [cardCount] = await connection.query('SELECT COUNT(*) as cnt FROM credit_cards');
  console.log(`   ✓ ${cardCount[0].cnt} credit cards ready\n`);

  // ─── 6. CREDIT SCORES ───
  console.log('📊 Creating credit scores...');
  for (const cust of allCustomers) {
    const score = 600 + Math.floor(Math.random() * 250);
    const loanFactor = Math.floor(Math.random() * 80);
    const creditFactor = -30 + Math.floor(Math.random() * 60);
    const missedFactor = -Math.floor(Math.random() * 40);

    await connection.query(
      `INSERT INTO credit_scores (customer_id, score, loan_repayment_factor, credit_usage_factor, missed_payments_factor) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE score = VALUES(score)`,
      [cust.id, score, loanFactor, creditFactor, missedFactor]
    );
  }
  console.log(`   ✓ Credit scores seeded\n`);

  // ─── 7. ALERTS ───
  console.log('🔔 Creating alerts...');
  const alertMessages = [
    { msg: 'Large transaction detected on your account', type: 'warning' },
    { msg: 'Your loan application has been approved', type: 'success' },
    { msg: 'Credit card payment due in 3 days', type: 'reminder' },
    { msg: 'New login from unknown device', type: 'security' },
    { msg: 'Monthly statement is available', type: 'info' },
    { msg: 'Suspicious activity detected — please verify', type: 'warning' },
    { msg: 'Your fixed deposit matures next week', type: 'info' },
    { msg: 'EMI payment successfully debited', type: 'success' },
  ];

  const [existingAlerts] = await connection.query('SELECT COUNT(*) as cnt FROM alerts');
  if (existingAlerts[0].cnt < 5) {
    for (const cust of allCustomers) {
      const count = 3 + Math.floor(Math.random() * 4); // 3-6 alerts per customer
      for (let i = 0; i < count; i++) {
        const alert = alertMessages[Math.floor(Math.random() * alertMessages.length)];
        const daysAgo = Math.floor(Math.random() * 30);
        const isRead = Math.random() > 0.5;
        const date = new Date(Date.now() - daysAgo * 86400000);

        await connection.query(
          'INSERT INTO alerts (customer_id, message, type, is_read, created_at) VALUES (?, ?, ?, ?, ?)',
          [cust.id, alert.msg, alert.type, isRead, date]
        );
      }
    }
  }
  const [alertCount] = await connection.query('SELECT COUNT(*) as cnt FROM alerts');
  console.log(`   ✓ ${alertCount[0].cnt} alerts ready\n`);

  // ─── 8. SCHEDULED TRANSACTIONS ───
  console.log('📅 Creating scheduled transactions...');
  const billTypes = ['Electricity', 'Water', 'Internet', 'Insurance', 'SIP'];
  const frequencies = ['monthly', 'monthly', 'monthly', 'monthly', 'monthly'];

  const [existingSched] = await connection.query('SELECT COUNT(*) as cnt FROM scheduled_transactions');
  if (existingSched[0].cnt < 3) {
    for (const acc of allAccounts.slice(0, 5)) {
      const billType = billTypes[Math.floor(Math.random() * billTypes.length)];
      const amount = 500 + Math.floor(Math.random() * 5000);
      const nextExec = new Date();
      nextExec.setDate(nextExec.getDate() + Math.floor(Math.random() * 28) + 1);

      await connection.query(
        `INSERT INTO scheduled_transactions (account_id, amount, frequency, bill_type, start_date, next_execution, is_active) 
         VALUES (?, ?, 'monthly', ?, CURDATE(), ?, 1)`,
        [acc.id, amount, billType, nextExec]
      );
    }
  }
  const [schedCount] = await connection.query('SELECT COUNT(*) as cnt FROM scheduled_transactions');
  console.log(`   ✓ ${schedCount[0].cnt} scheduled payments ready\n`);

  // ─── 9. AUDIT LOGS ───
  console.log('📝 Creating audit logs...');
  const auditActions = [
    'LOGIN_SUCCESS', 'DEPOSIT_SUCCESS', 'WITHDRAW_SUCCESS', 'TRANSFER_SUCCESS',
    'LOAN_APPLY', 'CC_SPEND_SUCCESS', 'CC_PAY_SUCCESS', 'PASSWORD_CHANGE'
  ];

  const [existingLogs] = await connection.query('SELECT COUNT(*) as cnt FROM audit_logs');
  if (existingLogs[0].cnt < 10) {
    for (let i = 0; i < 20; i++) {
      const action = auditActions[Math.floor(Math.random() * auditActions.length)];
      const daysAgo = Math.floor(Math.random() * 60);
      const date = new Date(Date.now() - daysAgo * 86400000);

      await connection.query(
        'INSERT INTO audit_logs (user_id, action, details, created_at) VALUES (?, ?, ?, ?)',
        [Math.ceil(Math.random() * 3), action, `Auto-seeded log entry #${i + 1}`, date]
      );
    }
  }
  const [logCount] = await connection.query('SELECT COUNT(*) as cnt FROM audit_logs');
  console.log(`   ✓ ${logCount[0].cnt} audit logs ready\n`);

  // ─── SUMMARY ───
  console.log('═══════════════════════════════════════');
  console.log('  ✅ Database fully seeded!');
  console.log('═══════════════════════════════════════');
  console.log(`  Customers:      ${allCustomers.length}`);
  console.log(`  Accounts:       ${allAccounts.length}`);
  console.log(`  Transactions:   ${txCount[0].cnt}`);
  console.log(`  Loans:          ${loanCount[0].cnt}`);
  console.log(`  Credit Cards:   ${cardCount[0].cnt}`);
  console.log(`  Alerts:         ${alertCount[0].cnt}`);
  console.log(`  Scheduled:      ${schedCount[0].cnt}`);
  console.log(`  Audit Logs:     ${logCount[0].cnt}`);
  console.log('═══════════════════════════════════════\n');

  await connection.end();
}

seedData().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
