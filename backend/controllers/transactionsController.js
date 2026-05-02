const { query } = require('../db/connection');

async function getTransactions(req, res) {
  try {
    const paramCustomerId = req.query.customerId;
    const user = req.user;
    const userRole = user?.role || 'customer';
    const sessionCustomerId = user?.customer_id;

    let targetCustomerId = paramCustomerId;
    if (userRole === 'customer') {
      targetCustomerId = sessionCustomerId;
    }

    if ((userRole === 'admin' || userRole === 'employee') && !targetCustomerId) {
      const transactions = await query(`
        SELECT t.id as id, t.type, t.amount, t.description, t.created_at, t.is_suspicious, t.category, t.status, a.account_number, c.first_name as customer_name 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN customers c ON a.customer_id = c.id
        ORDER BY t.created_at DESC
        LIMIT 1000
      `);
      return res.json(transactions);
    }

    if (!targetCustomerId) return res.json([]);

    const transactions = await query(`
      SELECT t.id as id, t.type, t.amount, t.description, t.created_at, t.is_suspicious, t.category, t.status, a.account_number 
      FROM transactions t 
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE a.customer_id = ?
      ORDER BY t.created_at DESC
    `, [targetCustomerId]);

    return res.json(transactions);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function createTransaction(req, res) {
  try {
    const { type, amount, account_id, receiver_account_id, description, otp } = req.body;

    if (!type || !amount || !account_id) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if ((type === 'withdraw' || type === 'transfer') && !otp) {
      return res.status(403).json({ success: false, error: 'OTP verification required', requireOTP: true });
    }

    const accountRes = await query('SELECT balance, customer_id FROM accounts WHERE id = ?', [account_id]);
    if (!accountRes.length) return res.status(404).json({ success: false, error: 'Account not found' });

    const account = accountRes[0];
    const currentBalance = parseFloat(account.balance);
    const txAmount = parseFloat(amount);

    if (txAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid transaction amount' });
    }
    if ((type === 'withdraw' || type === 'transfer') && currentBalance < txAmount) {
      return res.status(400).json({ success: false, error: 'Insufficient balance' });
    }

    const allowedCategories = ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Healthcare", "Other", "Transfer", "Deposit", "Withdraw", "Salary"];
    const categoryProvided = req.body.category && allowedCategories.includes(req.body.category);
    const safeCategory = categoryProvided ? req.body.category : (type === 'deposit' ? 'Deposit' : (type === 'withdraw' ? 'Withdraw' : 'Transfer'));

    const refId = 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    const insertRes = await query(
      'INSERT INTO transactions (account_id, type, amount, description, category, status) VALUES (?, ?, ?, ?, ?, ?)',
      [account_id, type === 'deposit' ? 'Deposit' : (type === 'withdraw' ? 'Withdrawal' : 'Transfer'), txAmount, description || `${type} transaction`, safeCategory, 'PENDING']
    );
    const newTxId = insertRes.insertId;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Fraud check
    const avgRes = await query('SELECT AVG(amount) as avg_amt FROM transactions WHERE account_id = ? AND type = ? AND status = "SUCCESS"', [account_id, type === 'deposit' ? 'Deposit' : (type === 'withdraw' ? 'Withdrawal' : 'Transfer')]);
    const avgAmount = avgRes[0]?.avg_amt ? parseFloat(avgRes[0].avg_amt) : 0;

    let isSuspicious = 0;
    let finalStatus = 'SUCCESS';

    if (avgAmount > 0 && txAmount > 3 * avgAmount) {
      isSuspicious = 1;
    }

    if (finalStatus === 'SUCCESS') {
      let newBalance = currentBalance;
      if (type === 'deposit') {
        newBalance = currentBalance + txAmount;
        await query('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, account_id]);
      } else if (type === 'withdraw') {
        newBalance = currentBalance - txAmount;
        await query('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, account_id]);
      } else if (type === 'transfer') {
        newBalance = currentBalance - txAmount;
        await query('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, account_id]);
        await query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [txAmount, receiver_account_id]);
      }

      await query('UPDATE transactions SET status = ?, is_suspicious = ? WHERE id = ?', ['SUCCESS', isSuspicious, newTxId]);
    } else {
      await query('UPDATE transactions SET status = ? WHERE id = ?', ['FAILED', newTxId]);
    }

    // Audit log
    const auditUserId = req.user?.user_id || 1;
    await query('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)', [
      auditUserId,
      `${type.toUpperCase()}_${finalStatus}`,
      `Tx ID: ${newTxId}, Ref: ${refId}, Amount: ${txAmount}`
    ]);

    return res.json({ success: true, transaction_id: newTxId, status: finalStatus, reference_id: refId, is_suspicious: isSuspicious === 1 });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Transaction processing failed' });
  }
}

module.exports = { getTransactions, createTransaction };
