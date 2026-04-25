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
        const userRes: any = await query('SELECT customer_id, email, role FROM users WHERE user_id = ?', [userId]);
        if (userRes.length) {
          const user = userRes[0];
          if (user.customer_id) {
            customerId = user.customer_id;
          } else if (user.role === 'customer') {
            // AUTO-FIX: Lazy initialize customer profile
            const aadhar = 'AD' + Math.floor(Math.random() * 100000000000).toString().padStart(12, '0');
            const customerRes: any = await query(
              'INSERT INTO customers (name, email, phone, address, aadhar) VALUES (?, ?, ?, ?, ?)',
              [user.email.split('@')[0], user.email, 'N/A', 'N/A', aadhar]
            );
            customerId = customerRes.insertId;
            await query('UPDATE users SET customer_id = ? WHERE user_id = ?', [customerId, userId]);

            // Create a default account for this lazily initialized customer
            const accountNo = 'ACC' + Math.floor(Math.random() * 1000000000).toString().padStart(10, '0');
            await query(
              'INSERT INTO accounts (customer_id, account_no, branch_id, bank_name, account_type, balance, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [customerId, accountNo, 1, 'SBI', 'Savings', 0, 'Active']
            );
          }
        }
      }
    }

    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Customer context not found' }, { status: 401 });
    }

    const [b]: any = await query('SELECT SUM(balance) as totalBalance FROM accounts WHERE customer_id = ?', [customerId]);
    const balanceResult = b;
    const [a]: any = await query('SELECT COUNT(*) as totalAccounts FROM accounts WHERE customer_id = ?', [customerId]);
    const accountsResult = a;
    const customersResult = { totalCustomers: 1 };
    
    const fraudAlerts = await query(`
      SELECT t.*, a.account_no as account_no 
      FROM transactions t 
      LEFT JOIN accounts a ON t.account_id = a.account_id
      WHERE t.is_suspicious = 1 AND a.customer_id = ?
    `, [customerId]);

    const recentTx = await query(`
      SELECT t.transaction_id as id, t.description, t.type, t.amount, t.created_at as transaction_date, a.account_no as account_no
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.account_id
      WHERE a.customer_id = ?
      ORDER BY t.created_at DESC LIMIT 8
    `, [customerId]);

    const myAccounts = await query(`
      SELECT account_id as id, account_no as account_no, balance, account_type as type, status FROM accounts WHERE customer_id = ? LIMIT 3
    `, [customerId]);

    return NextResponse.json({
      success: true,
      data: {
        totalBalance: balanceResult?.totalBalance || 0,
        totalAccounts: accountsResult?.totalAccounts || 0,
        totalCustomers: customersResult.totalCustomers || 0,
        fraudAlerts,
        recentTx,
        myAccounts
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
