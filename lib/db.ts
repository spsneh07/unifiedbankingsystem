import mysql from 'mysql2/promise';

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

export async function query(sql: string, params?: any[]) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database Query Error:', error);
    throw error;
  }
}

export default pool;
