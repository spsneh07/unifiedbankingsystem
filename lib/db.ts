import mysql from 'mysql2/promise';
import * as mockData from './mockData';

const globalForPool = global as unknown as { pool: mysql.Pool };

export const pool =
  globalForPool.pool ||
  mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'banking_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

if (process.env.NODE_ENV !== 'production') globalForPool.pool = pool;

async function mockQuery(sql: string, params?: any[]) {
  const q = sql.toLowerCase().trim();
  
  // User role lookup
  if (q.includes('from users')) {
    if (q.includes('email = ?')) {
      const email = params?.[0];
      if (email === 'admin@nexusbank.com') {
        return [{ id: 1, user_id: 1, email: 'admin@nexusbank.com', password: 'admin', role: 'admin', customer_id: null }];
      }
      if (email === 'customer@nexusbank.com') {
        return [{ id: 2, user_id: 2, email: 'customer@nexusbank.com', password: 'password', role: 'customer', customer_id: 1 }];
      }
    }
    if (q.includes('user_id = ?')) {
      const userId = String(params?.[0]);
      if (userId === '1') return [{ user_id: 1, role: 'admin', email: 'admin@nexusbank.com', customer_id: null }];
      if (userId === '2') return [{ user_id: 2, role: 'customer', email: 'customer@nexusbank.com', customer_id: 1 }];
    }
    return [];
  }

  // Aggregate stats for dashboard
  if (q.includes('sum(balance)')) return [{ totalBalance: 2375100 }];
  if (q.includes('count(*) as totalaccounts')) return [{ totalAccounts: 20 }];
  if (q.includes('count(*) as totalcustomers')) return [{ totalCustomers: 15 }];

  if (q.includes('from customers')) {
    return mockData.mockCustomers.map(c => ({
      id: c.customer_id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address,
      aadhar_number: c.aadhar_number,
      created_at: c.created_at
    }));
  }
  
  if (q.includes('from accounts')) {
    return mockData.mockAccounts.map(a => ({
      ...a,
      id: a.account_id
    }));
  }

  if (q.includes('from transactions')) {
    const txs = q.includes('is_suspicious = 1') 
      ? mockData.mockTransactions.filter(t => t.is_suspicious)
      : mockData.mockTransactions;
    
    return txs.map(t => ({
      ...t,
      id: t.transaction_id,
      created_at: t.transaction_date // Mapping for dashboard expect created_at
    }));
  }

  if (q.includes('from branches')) return mockData.mockBranches;
  if (q.includes('from employees')) return mockData.mockEmployees;
  if (q.includes('from password_resets')) return [];

  console.log('Mock Query unhandled:', sql);
  return [];
}



export async function query(sql: string, params?: any[]) {
  const useMock = process.env.USE_MOCK_DB === 'true';
  
  if (useMock) {
    return mockQuery(sql, params);
  }

  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error: any) {
    // If connection fails and we are in dev, fallback to mock
    if (process.env.NODE_ENV !== 'production' && (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR')) {
      console.warn(`DB connection failed (${error.code}), falling back to mock mode.`);
      return mockQuery(sql, params);
    }
    console.error('Database Query Error:', error);
    throw error;
  }
}

export default pool;

