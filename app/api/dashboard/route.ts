import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let customerId = searchParams.get('customerId');

    const cookieStore = await cookies();
    const userId = cookieStore.get('ub_user_id')?.value;
    let userRole = 'customer';
    let resolvedUserId = null;

    if (userId) {
      const userRes: any = await query('SELECT customer_id, email, role, user_id FROM users WHERE user_id = ?', [userId]);
      if (userRes.length) {
        const user = userRes[0];
        userRole = user.role;
        resolvedUserId = user.user_id;
        if (user.customer_id) {
          customerId = user.customer_id;
        } else if (user.role === 'customer') {
          // AUTO-FIX: Lazy initialize customer profile
          const customerRes: any = await query(
            'INSERT INTO customers (user_id, first_name, last_name, phone, address) VALUES (?, ?, ?, ?, ?)',
            [userId, user.email.split('@')[0], 'User', 'N/A', 'N/A']
          );
          customerId = customerRes.insertId;
          await query('UPDATE users SET customer_id = ? WHERE user_id = ?', [customerId, userId]);

          // Create a default account for this lazily initialized customer
          const accountNo = 'ACC' + Math.floor(Math.random() * 1000000000).toString().padStart(10, '0');
          await query(
            'INSERT INTO accounts (customer_id, account_number, type, balance, status) VALUES (?, ?, ?, ?, ?)',
            [customerId, accountNo, 'savings', 0, 'active']
          );
        }
      }
    }

    if (userRole === 'admin' || userRole === 'employee') {
      // Return GLOBAL stats for admins/employees
      const [b]: any = await query('SELECT SUM(balance) as totalBalance FROM accounts');
      const [a]: any = await query('SELECT COUNT(*) as totalAccounts FROM accounts');
      const [c]: any = await query('SELECT COUNT(*) as totalCustomers FROM customers');
      
      const fraudAlerts = await query(`
        SELECT t.*, a.account_number as account_no 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE t.is_suspicious = 1
      `);

      const recentTx = await query(`
        SELECT t.id as id, t.description, t.type, t.amount, t.created_at as transaction_date, a.account_number as account_no
        FROM transactions t
        LEFT JOIN accounts a ON t.account_id = a.id
        ORDER BY t.created_at DESC LIMIT 10
      `);

      return NextResponse.json({
        success: true,
        data: {
          totalBalance: b?.totalBalance || 0,
          totalAccounts: a?.totalAccounts || 0,
          totalCustomers: c?.totalCustomers || 0,
          fraudAlerts,
          recentTx
        }
      });
    }

    // Regular customer logic
    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Customer context not found' }, { status: 401 });
    }

    const [b]: any = await query('SELECT SUM(balance) as totalBalance FROM accounts WHERE customer_id = ?', [customerId]);
    const balanceResult = b;
    const [a]: any = await query('SELECT COUNT(*) as totalAccounts FROM accounts WHERE customer_id = ?', [customerId]);
    const accountsResult = a;
    const customersResult = { totalCustomers: 1 };
    
    const fraudAlerts = await query(`
      SELECT t.*, a.account_number as account_no 
      FROM transactions t 
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.is_suspicious = 1 AND a.customer_id = ?
    `, [customerId]);

    const recentTx = await query(`
      SELECT t.id as id, t.description, t.type, t.amount, t.created_at as transaction_date, a.account_number as account_no
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE a.customer_id = ?
      ORDER BY t.created_at DESC LIMIT 8
    `, [customerId]);

    const myAccounts = await query(`
      SELECT id as id, account_number as account_no, balance, type as type, status FROM accounts WHERE customer_id = ? LIMIT 3
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
