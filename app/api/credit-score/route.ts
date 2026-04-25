import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * Credit Score Calculation Logic
 *
 * Base score: 700
 *
 * Factors:
 * 1. Loan Repayment (+80 max): approved loans boost score
 *    +40 per approved loan (capped at +80)
 *    -30 per rejected loan (penalty for defaults)
 *
 * 2. Credit Utilization (-100 to +30):
 *    Cards with usage < 30% → +10 each (healthy usage)
 *    Cards with usage 30–80% → 0 (neutral)
 *    Cards with usage > 80% → -30 each (risky)
 *
 * 3. Missed Payments (-20 per missed):
 *    Flagged suspicious transactions count as missed payment signals
 *    -20 per suspicious tx (capped at -60)
 *
 * Final score is clamped between 300–900
 */
async function calculateScore(customerId: number): Promise<{
  score: number;
  loan_repayment_factor: number;
  credit_usage_factor: number;
  missed_payments_factor: number;
}> {
  const loans: any = await query(
    'SELECT status FROM loans WHERE customer_id = ?',
    [customerId]
  );
  let loanFactor = 0;
  for (const loan of loans) {
    if (loan.status === 'approved') loanFactor += 40;
    else if (loan.status === 'rejected') loanFactor -= 30;
  }
  loanFactor = Math.min(loanFactor, 80); // cap at +80

  const cards: any = await query(
    'SELECT limit_amount, used_amount FROM credit_cards WHERE customer_id = ?',
    [customerId]
  );
  let creditFactor = 0;
  for (const card of cards) {
    const pct = (card.used_amount / card.limit_amount) * 100;
    if (pct < 30) creditFactor += 10;
    else if (pct > 80) creditFactor -= 30;
  }
  creditFactor = Math.max(Math.min(creditFactor, 30), -100); // clamp

  const suspicious: any = await query(`
    SELECT COUNT(*) as cnt
    FROM transactions t
    JOIN accounts a ON t.account_id = a.account_id
    WHERE a.customer_id = ? AND t.is_suspicious = 1
  `, [customerId]);
  const suspiciousCount = suspicious[0]?.cnt || 0;
  const missedFactor = Math.max(-60, suspiciousCount * -20);

  const raw = 700 + loanFactor + creditFactor + missedFactor;
  const score = Math.min(900, Math.max(300, raw));

  return { score, loan_repayment_factor: loanFactor, credit_usage_factor: creditFactor, missed_payments_factor: missedFactor };
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('ub_user_id')?.value;
    const role = cookieStore.get('ub_role')?.value;

    if (role === 'admin' || role === 'employee') {
      const scores = await query(`
        SELECT cs.*, c.name as customer_name, c.email
        FROM credit_scores cs
        JOIN customers c ON cs.customer_id = c.customer_id
        ORDER BY cs.score DESC
      `);
      return NextResponse.json(scores);
    }

    let customerId = null;
    if (userId) {
      const userRes: any = await query('SELECT customer_id FROM users WHERE user_id = ?', [userId]);
      if (userRes.length && userRes[0].customer_id) customerId = userRes[0].customer_id;
    }

    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { score, loan_repayment_factor, credit_usage_factor, missed_payments_factor } = await calculateScore(customerId);

    await query(`
      INSERT INTO credit_scores (customer_id, score, loan_repayment_factor, credit_usage_factor, missed_payments_factor)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        score = VALUES(score),
        loan_repayment_factor = VALUES(loan_repayment_factor),
        credit_usage_factor = VALUES(credit_usage_factor),
        missed_payments_factor = VALUES(missed_payments_factor),
        last_calculated = CURRENT_TIMESTAMP
    `, [customerId, score, loan_repayment_factor, credit_usage_factor, missed_payments_factor]);

    return NextResponse.json({ score, loan_repayment_factor, credit_usage_factor, missed_payments_factor });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
