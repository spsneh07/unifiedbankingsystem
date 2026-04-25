import { query } from './lib/db';

async function main() {
  const usersDesc = await query('DESCRIBE users');
  const customersDesc = await query('DESCRIBE customers');
  console.log('users schema:', usersDesc);
  console.log('customers schema:', customersDesc);
  process.exit(0);
}
main();
