const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || process.env.SUPABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();

    console.log('Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'db', 'supabase_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await client.query(schemaSql);
    console.log('Schema executed successfully.');

    console.log('Reading seed.sql...');
    const seedPath = path.join(__dirname, 'db', 'supabase_seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('Executing seed...');
    await client.query(seedSql);
    console.log('Seed executed successfully.');

  } catch (error) {
    console.error('Migration Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
