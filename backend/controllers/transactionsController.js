const { pool } = require('../db/connection');
const { validateOTP } = require('../middleware/otpService');

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
      const transactions = await pool.execute(`
        SELECT t.id as id, t.type, t.amount, t.description, t.created_at,
               t.is_suspicious, t.category, t.status,
               a.account_number, c.first_name as customer_name 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN customers c ON a.customer_id = c.id
        ORDER BY t.created_at DESC
        LIMIT 1000
      `);
      return res.json(transactions[0]);
    }

    if (!targetCustomerId) return res.json([]);

    const [transactions] = await pool.execute(`
      SELECT t.id as id, t.type, t.amount, t.description, t.created_at,
             t.is_suspicious, t.category, t.status, a.account_number 
      FROM transactions t 
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE a.customer_id = ?
      ORDER BY t.created_at DESC
    `, [targetCustomerId]);

    return res.json(transactions);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
}

async function createTransaction(req, res) {
  const conn = await pool.getConnection();
  try {
    const { type, amount: rawAmount, account_id, receiver_account_id, description, otp, category } = req.body;

    // ─── Input validation ─────────────────────────────────────────────────────
    if (!type || !account_id) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const validTypes = ['deposit', 'withdraw', 'transfer'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid transaction type' });
    }

    const txAmount = parseFloat(rawAmount);
    if (isNaN(txAmount) || !isFinite(txAmount) || txAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be a positive number' });
    }
    if (txAmount > 10_000_000) {
      return res.status(400).json({ success: false, error: 'Amount exceeds maximum allowed (₹1,00,00,000)' });
    }

    // ─── OTP Verification ─────────────────────────────────────────────────────
    if (type === 'withdraw' || type === 'transfer') {
      const userId = req.user?.user_id;
      if (!otp) {
        return res.status(403).json({ success: false, error: 'OTP is required for this operation', requireOTP: true });
      }
      const otpResult = validateOTP(userId, otp);
      if (!otpResult.valid) {
        return res.status(403).json({ success: false, error: `OTP failed: ${otpResult.reason}`, requireOTP: true });
      }
    }

    // ─── Self-transfer check ─────────────────────────────────────────────────
    if (type === 'transfer') {
      if (!receiver_account_id) {
        return res.status(400).json({ success: false, error: 'Recipient account is required for transfer' });
      }
      if (String(account_id) === String(receiver_account_id)) {
        return res.status(400).json({ success: false, error: 'Cannot transfer to the same account' });
      }
    }

    // ─── Atomic DB Transaction ────────────────────────────────────────────────
    await conn.beginTransaction();

    // Lock the source account to prevent race conditions
    const [accountRes] = await conn.execute(
      'SELECT id, balance, customer_id, status FROM accounts WHERE id = ? FOR UPDATE',
      [account_id]
    );
    if (!accountRes.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    const account = accountRes[0];
    if (account.status?.toLowerCase() !== 'active') {
      await conn.rollback();
      return res.status(400).json({ success: false, error: 'Account is not active' });
    }

    const currentBalance = parseFloat(account.balance);

    // Authorization: customer can only transact on their own accounts
    if (req.user?.role === 'customer' && account.customer_id !== req.user.customer_id) {
      await conn.rollback();
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Insufficient balance check
    if ((type === 'withdraw' || type === 'transfer') && currentBalance < txAmount) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. Available: ₹${currentBalance.toFixed(2)}`
      });
    }

    // Validate receiver account for transfers
    let receiverAccount = null;
    if (type === 'transfer') {
      const [recRes] = await conn.execute(
        'SELECT id, balance, status FROM accounts WHERE id = ? FOR UPDATE',
        [receiver_account_id]
      );
      if (!recRes.length) {
        await conn.rollback();
        return res.status(404).json({ success: false, error: 'Recipient account not found' });
      }
      receiverAccount = recRes[0];
      if (receiverAccount.status?.toLowerCase() !== 'active') {
        await conn.rollback();
        return res.status(400).json({ success: false, error: 'Recipient account is not active' });
      }
    }

    // Normalize type for DB storage
    const dbType = type === 'deposit' ? 'Deposit' : type === 'withdraw' ? 'Withdrawal' : 'Transfer';

    const allowedCategories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Other', 'Transfer', 'Deposit', 'Withdraw', 'Salary'];
    const safeCategory = allowedCategories.includes(category)
      ? category
      : type === 'deposit' ? 'Deposit' : type === 'withdraw' ? 'Withdrawal' : 'Transfer';

    // Insert transaction record as PENDING
    const [insertRes] = await conn.execute(
      'INSERT INTO transactions (account_id, type, amount, description, category, status) VALUES (?, ?, ?, ?, ?, ?)',
      [account_id, dbType, txAmount, description || `${dbType} transaction`, safeCategory, 'PENDING']
    );
    const newTxId = insertRes.insertId;
    const refId = `TXN-${Date.now()}-${String(newTxId).padStart(6, '0')}`;

    // Update balances
    if (type === 'deposit') {
      await conn.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [txAmount, account_id]);
    } else if (type === 'withdraw') {
      await conn.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [txAmount, account_id]);
    } else if (type === 'transfer') {
      await conn.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [txAmount, account_id]);
      await conn.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [txAmount, receiver_account_id]);

      // Create mirrored credit transaction for receiver
      await conn.execute(
        'INSERT INTO transactions (account_id, type, amount, description, category, status) VALUES (?, ?, ?, ?, ?, ?)',
        [receiver_account_id, 'Deposit', txAmount, description || 'Transfer received', 'Transfer', 'SUCCESS']
      );
    }

    // Fraud detection: flag if > 3× average
    const [avgRes] = await conn.execute(
      'SELECT AVG(amount) as avg_amt FROM transactions WHERE account_id = ? AND type = ? AND status = \'SUCCESS\'',
      [account_id, dbType]
    );
    const avgAmount = parseFloat(avgRes[0]?.avg_amt) || 0;
    const isSuspicious = avgAmount > 0 && txAmount > 3 * avgAmount ? 1 : 0;

    // Finalize transaction
    await conn.execute(
      'UPDATE transactions SET status = ?, is_suspicious = ? WHERE id = ?',
      ['SUCCESS', isSuspicious, newTxId]
    );

    // Audit log
    const auditUserId = req.user?.user_id || null;
    await conn.execute(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [auditUserId, `${dbType.toUpperCase()}_SUCCESS`, `Tx: ${newTxId}, Ref: ${refId}, Amount: ${txAmount}`]
    );

    await conn.commit();

    return res.json({
      success: true,
      transaction_id: newTxId,
      status: 'SUCCESS',
      reference_id: refId,
      is_suspicious: isSuspicious === 1,
    });

  } catch (error) {
    await conn.rollback();
    console.error('Transaction error:', error);
    return res.status(500).json({ success: false, error: 'Transaction processing failed. Please try again.' });
  } finally {
    conn.release();
  }
}

module.exports = { getTransactions, createTransaction };
