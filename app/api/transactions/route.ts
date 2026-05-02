import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paramCustomerId = searchParams.get('customerId');
    
    const cookieStore = await cookies();
    const userId = cookieStore.get('ub_user_id')?.value;
    let userRole = 'customer';
    let sessionCustomerId = null;

    if (userId) {
      const userRes: any = await query('SELECT customer_id, role FROM users WHERE user_id = ?', [userId]);
      if (userRes.length) {
        userRole = userRes[0].role;
        sessionCustomerId = userRes[0].customer_id;
      }
    }

    let targetCustomerId = paramCustomerId;
    if (userRole === 'customer') {
      targetCustomerId = sessionCustomerId;
    }

    // Role-based Query Logic
    if ((userRole === 'admin' || userRole === 'employee') && !targetCustomerId) {
      // Return ALL transactions for admin/employee if no specific customer is requested
      const transactions = await query(`
      SELECT t.id as id, t.type, t.amount, t.description, t.created_at, t.is_suspicious, t.category, t.status, a.account_number, c.first_name as customer_name 
      FROM transactions t 
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN customers c ON a.customer_id = c.id
      ORDER BY t.created_at DESC
      LIMIT 1000
    `);
    return NextResponse.json(transactions);
  }

  if (!targetCustomerId) return NextResponse.json([]);

  const transactions = await query(`
    SELECT t.id as id, t.type, t.amount, t.description, t.created_at, t.is_suspicious, t.category, t.status, a.account_number 
    FROM transactions t 
    LEFT JOIN accounts a ON t.account_id = a.id
    WHERE a.customer_id = ?
    ORDER BY t.created_at DESC
  `, [targetCustomerId]);
    
    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, amount, account_id, receiver_account_id, description, otp } = body;

    if (!type || !amount || !account_id) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // SIMULATED SECURITY LAYER: check for OTP (mock)
    // We will just expect any 6 digit OTP or mock it if not provided to make it easy for frontend.
    // If we want a strict check: if (!otp) return error. 
    // Let's make it strict if OTP is required for withdrawals and transfers.
    if ((type === 'withdraw' || type === 'transfer') && !otp) {
      return NextResponse.json({ success: false, error: 'OTP verification required', requireOTP: true }, { status: 403 });
    }

    const [account]: any = await query('SELECT balance, customer_id FROM accounts WHERE id = ?', [account_id]);
    if (!account) return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });

    const currentBalance = parseFloat(account.balance);
    const txAmount = parseFloat(amount);

    // VALIDATION LAYER
    if (txAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid transaction amount' }, { status: 400 });
    }
    if ((type === 'withdraw' || type === 'transfer') && currentBalance < txAmount) {
      return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
    }

    const allowedCategories = ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Healthcare", "Other", "Transfer", "Deposit", "Withdraw", "Salary"];
    const categoryProvided = body.category && allowedCategories.includes(body.category);
    const safeCategory = categoryProvided ? body.category : (type === 'deposit' ? 'Deposit' : (type === 'withdraw' ? 'Withdraw' : 'Transfer'));

    const refId = 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    // STEP 1: Insert PENDING transaction
    const insertRes: any = await query(
      'INSERT INTO transactions (account_id, type, amount, description, category, status) VALUES (?, ?, ?, ?, ?, ?)', 
      [account_id, type === 'deposit' ? 'Deposit' : (type === 'withdraw' ? 'Withdrawal' : 'Transfer'), txAmount, description || `${type} transaction`, safeCategory, 'PENDING']
    );
    const newTxId = insertRes.insertId;

    // STEP 2: SIMULATE VERIFICATION
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing delay

    // STEP 5: FRAUD CHECK
    const avgRes: any = await query('SELECT AVG(amount) as avg_amt FROM transactions WHERE account_id = ? AND type = ? AND status = "SUCCESS"', [account_id, type === 'deposit' ? 'Deposit' : (type === 'withdraw' ? 'Withdrawal' : 'Transfer')]);
    const avgAmount = avgRes[0]?.avg_amt ? parseFloat(avgRes[0].avg_amt) : 0;
    
    let isSuspicious = 0;
    let finalStatus = 'SUCCESS';
    
    if (avgAmount > 0 && txAmount > 3 * avgAmount) {
      isSuspicious = 1;
      // You can decide if suspicious means FAILED or just flagged. User says "mark transaction suspicious".
      // We will flag it and let it succeed for demo purposes, or mark it SUSPICIOUS. Let's just flag it.
    }

    // Another mock check: sometimes randomly fail (optional). We will just succeed to keep the happy path working.

    // STEP 3: UPDATE BASED ON RESULT
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

    // STEP 4: AUDIT LOG
    // We need user_id, which we can get from cookies or the account
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get('ub_user_id')?.value;
    const auditUserId = sessionUserId || 1; // fallback
    await query('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)', [
      auditUserId,
      `${type.toUpperCase()}_${finalStatus}`,
      `Tx ID: ${newTxId}, Ref: ${refId}, Amount: ${txAmount}`
    ]);

    return NextResponse.json({ success: true, transaction_id: newTxId, status: finalStatus, reference_id: refId, is_suspicious: isSuspicious === 1 });
  } catch (error: any) {
    console.error('Transaction Error:', error);
    return NextResponse.json({ success: false, error: 'Transaction processing failed' }, { status: 500 });
  }
}
