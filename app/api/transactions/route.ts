import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let customerId = searchParams.get('customerId');

    if (!customerId) {
      const cookieStore = await cookies();
      const userId = cookieStore.get('ub_user_id')?.value;
      if (userId) {
        const userRes: any = await query('SELECT customer_id FROM users WHERE user_id = ?', [userId]);
        if (userRes.length && userRes[0].customer_id) customerId = userRes[0].customer_id;
      }
    }

    if (!customerId) return NextResponse.json([]);

    const transactions = await query(`
      SELECT t.transaction_id as id, t.type, t.amount, t.description, t.created_at, t.is_suspicious, t.category, a.account_no as account_number 
      FROM transactions t 
      LEFT JOIN accounts a ON t.account_id = a.account_id
      WHERE a.customer_id = ?
      ORDER BY t.created_at DESC
    `, [customerId]);
    
    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, amount, account_id, receiver_account_id, description } = body;

    if (!type || !amount || !account_id) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const [account]: any = await query('SELECT balance FROM accounts WHERE account_id = ?', [account_id]);
    if (!account) return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });

    const currentBalance = parseFloat(account.balance);
    const txAmount = parseFloat(amount);

    const allowedCategories = [
      "Food", "Travel", "Shopping", "Bills",
      "Entertainment", "Healthcare", "Other",
      "Transfer", "Deposit", "Withdraw", "Salary"
    ];

    const categoryProvided = body.category && allowedCategories.includes(body.category);
    const safeCategory = categoryProvided ? body.category : null;

    if (type === 'deposit') {
      const newBalance = currentBalance + txAmount;
      await query('UPDATE accounts SET balance = ? WHERE account_id = ?', [newBalance, account_id]);
      await query('INSERT INTO transactions (account_id, type, amount, balance_after, description, category) VALUES (?, ?, ?, ?, ?, ?)', 
        [account_id, 'Deposit', txAmount, newBalance, description || 'Deposit', safeCategory || 'Other']);
    } else if (type === 'withdraw') {
      if (currentBalance < txAmount) return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
      const newBalance = currentBalance - txAmount;
      await query('UPDATE accounts SET balance = ? WHERE account_id = ?', [newBalance, account_id]);
      await query('INSERT INTO transactions (account_id, type, amount, balance_after, description, category) VALUES (?, ?, ?, ?, ?, ?)', 
        [account_id, 'Withdrawal', txAmount, newBalance, description || 'Withdrawal', safeCategory || 'Bills']);
    } else if (type === 'transfer') {
      if (!receiver_account_id) return NextResponse.json({ success: false, error: 'Missing receiver account' }, { status: 400 });
      if (currentBalance < txAmount) return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
      
      const newBalance = currentBalance - txAmount;
      await query('UPDATE accounts SET balance = ? WHERE account_id = ?', [newBalance, account_id]);
      await query('UPDATE accounts SET balance = balance + ? WHERE account_id = ?', [txAmount, receiver_account_id]);
      await query('INSERT INTO transactions (account_id, type, amount, balance_after, description, category) VALUES (?, ?, ?, ?, ?, ?)', 
        [account_id, 'Transfer', txAmount, newBalance, description || 'Transfer to ' + receiver_account_id, safeCategory || 'Other']);
    } else {
      return NextResponse.json({ success: false, error: 'Invalid transaction type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
