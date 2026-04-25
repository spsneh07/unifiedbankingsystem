import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const [balanceResult]: any = await query('SELECT SUM(balance) as totalBalance FROM accounts');
    const [accountsResult]: any = await query('SELECT COUNT(*) as totalAccounts FROM accounts');
    const [customersResult]: any = await query('SELECT COUNT(*) as totalCustomers FROM customers');
    
    // Fraud detection
    const fraudAlerts: any = await query(`
      SELECT t.*, a.account_no as account_number 
      FROM transactions t 
      LEFT JOIN accounts a ON t.account_id = a.account_id
      WHERE amount > (SELECT AVG(amount)*3 FROM transactions)
    `);

    const recentTx: any = await query(`
      SELECT t.transaction_id as id, t.description, t.type, t.amount, t.created_at as transaction_date, a.account_no
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.account_id
      ORDER BY t.created_at DESC LIMIT 8
    `);

    const myAccounts: any = await query(`
      SELECT account_id as id, account_no as account_number, balance, account_type as type, status FROM accounts LIMIT 3
    `);

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
