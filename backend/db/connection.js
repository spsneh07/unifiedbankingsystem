const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_URL;

const pgPool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false } // Required for Supabase
});

pgPool.on('error', (err) => {
  console.error('PostgreSQL Pool Error:', err);
});

// A smart helper to convert MySQL '?' to PostgreSQL '$1, $2...'
function convertSql(sql) {
  let paramCount = 1;
  let pgSql = sql.replace(/\?/g, () => `$${paramCount++}`);
  
  // Auto-append RETURNING for INSERTs to simulate MySQL insertId
  if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
    pgSql += ' RETURNING *';
  }
  return pgSql;
}

// Wrapper for individual queries (used by authController mostly)
async function query(sql, params) {
  const client = await pgPool.connect();
  try {
    const pgSql = convertSql(sql);
    const res = await client.query(pgSql, params);
    
    // Simulate mysql2 insert result
    if (res.command === 'INSERT') {
      const resultObj = { affectedRows: res.rowCount };
      if (res.rows.length > 0) {
        const row = res.rows[0];
        resultObj.insertId = row.id || row.user_id || row.customer_id || row.alert_id || row.schedule_id || Object.values(row)[0];
      }
      return resultObj;
    }
    
    return res.rows;
  } catch (error) {
    console.error('Database Query Error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Pool mock to simulate mysql2 pool API and transactions
const pool = {
  execute: async (sql, params) => {
    const pgSql = convertSql(sql);
    const res = await pgPool.query(pgSql, params);
    if (res.command === 'INSERT' || res.command === 'UPDATE' || res.command === 'DELETE') {
      const resultObj = { affectedRows: res.rowCount };
      if (res.command === 'INSERT' && res.rows.length > 0) {
        const row = res.rows[0];
        resultObj.insertId = row.id || row.user_id || row.customer_id || row.alert_id || row.schedule_id || Object.values(row)[0];
      }
      return [resultObj, []]; // [result, fields]
    }
    return [res.rows, res.fields || []]; // [rows, fields]
  },
  query: async (sql, params) => {
    return pool.execute(sql, params);
  },
  getConnection: async () => {
    const client = await pgPool.connect();
    return {
      beginTransaction: async () => client.query('BEGIN'),
      commit: async () => client.query('COMMIT'),
      rollback: async () => client.query('ROLLBACK'),
      release: () => client.release(),
      execute: async (sql, params) => {
        const pgSql = convertSql(sql);
        const res = await client.query(pgSql, params);
        if (res.command === 'INSERT' || res.command === 'UPDATE' || res.command === 'DELETE') {
          const resultObj = { affectedRows: res.rowCount };
          if (res.command === 'INSERT' && res.rows.length > 0) {
            const row = res.rows[0];
            resultObj.insertId = row.id || row.user_id || row.customer_id || row.alert_id || row.schedule_id || Object.values(row)[0];
          }
          return [resultObj, []];
        }
        return [res.rows, res.fields || []];
      },
      query: async function(sql, params) {
        return this.execute(sql, params);
      }
    };
  }
};

module.exports = { pool, query };
