import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    let balanceResult, accountsResult, customersResult, fraudAlerts, recentTx, myAccounts;

    if (customerId) {
      const [b]: any = await query('SELECT SUM(balance) as totalBalance FROM accounts WHERE customer_id = ?', [customerId]);
      balanceResult = b;
      const [a]: any = await query('SELECT COUNT(*) as totalAccounts FROM accounts WHERE customer_id = ?', [customerId]);
      accountsResult = a;
      customersResult = { totalCustomers: 1 };
      
      fraudAlerts = await query(`
        SELECT t.*, a.account_number as account_no 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE amount > (SELECT AVG(amount)*3 FROM transactions) AND a.customer_id = ?
      `, [customerId]);

      recentTx = await query(`
        SELECT t.id, t.description, t.type, t.amount, t.created_at as transaction_date, a.account_number as account_no
        FROM transactions t
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE a.customer_id = ?
        ORDER BY t.created_at DESC LIMIT 8
      `, [customerId]);

      myAccounts = await query(`
        SELECT id, account_number as account_no, balance, type, status FROM accounts WHERE customer_id = ? LIMIT 3
      `, [customerId]);
    } else {
      const [b]: any = await query('SELECT SUM(balance) as totalBalance FROM accounts');
      balanceResult = b;
      const [a]: any = await query('SELECT COUNT(*) as totalAccounts FROM accounts');
      accountsResult = a;
      const [c]: any = await query('SELECT COUNT(*) as totalCustomers FROM customers');
      customersResult = c;
      
      fraudAlerts = await query(`
        SELECT t.*, a.account_number as account_no 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE amount > (SELECT AVG(amount)*3 FROM transactions)
      `);

      recentTx = await query(`
        SELECT t.id, t.description, t.type, t.amount, t.created_at as transaction_date, a.account_number as account_no
        FROM transactions t
        LEFT JOIN accounts a ON t.account_id = a.id
        ORDER BY t.created_at DESC LIMIT 8
      `);

      myAccounts = await query(`
        SELECT id, account_number as account_no, balance, type, status FROM accounts LIMIT 3
      `);
    }

    return NextResponse.json({
      success: true,
      data: {
        totalBalance: balanceResult.totalBalance || 0,
        totalAccounts: accountsResult.totalAccounts || 0,
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
