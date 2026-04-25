import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    let transactions;
    if (customerId) {
      transactions = await query(`
        SELECT t.transaction_id as id, t.type, t.amount, t.description, t.created_at, t.is_suspicious, t.category, a.account_no as account_number 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.account_id
        WHERE a.customer_id = ?
        ORDER BY t.created_at DESC
      `, [customerId]);
    } else {
      transactions = await query(`
        SELECT t.transaction_id as id, t.type, t.amount, t.description, t.created_at, t.is_suspicious, t.category, a.account_no as account_number 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.account_id
        ORDER BY t.created_at DESC
      `);
    }
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

    if (type === 'deposit') {
      await query('UPDATE accounts SET balance = balance + ? WHERE account_id = ?', [txAmount, account_id]);
      await query('INSERT INTO transactions (account_id, type, amount, description, category) VALUES (?, ?, ?, ?, ?)', 
        [account_id, 'deposit', txAmount, description || 'Deposit', 'Income']);
    } else if (type === 'withdraw') {
      if (currentBalance < txAmount) return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
      await query('UPDATE accounts SET balance = balance - ? WHERE account_id = ?', [txAmount, account_id]);
      await query('INSERT INTO transactions (account_id, type, amount, description, category) VALUES (?, ?, ?, ?, ?)', 
        [account_id, 'withdraw', txAmount, description || 'Withdrawal', 'Expense']);
    } else if (type === 'transfer') {
      if (!receiver_account_id) return NextResponse.json({ success: false, error: 'Missing receiver account' }, { status: 400 });
      if (currentBalance < txAmount) return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
      
      await query('UPDATE accounts SET balance = balance - ? WHERE account_id = ?', [txAmount, account_id]);
      await query('UPDATE accounts SET balance = balance + ? WHERE account_id = ?', [txAmount, receiver_account_id]);
      await query('INSERT INTO transactions (account_id, type, amount, description, category) VALUES (?, ?, ?, ?, ?)', 
        [account_id, 'transfer', txAmount, description || 'Transfer to ' + receiver_account_id, 'Transfer']);
    } else {
      return NextResponse.json({ success: false, error: 'Invalid transaction type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
