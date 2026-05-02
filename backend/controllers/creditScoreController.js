const { query } = require('../db/connection');

async function calculateScore(customerId) {
  const loans = await query('SELECT status FROM loans WHERE customer_id = ?', [customerId]);
  let loanFactor = 0;
  for (const loan of loans) {
    if (loan.status === 'approved') loanFactor += 40;
    else if (loan.status === 'rejected') loanFactor -= 30;
  }
  loanFactor = Math.min(loanFactor, 80);

  const cards = await query('SELECT limit_amount, used_amount FROM credit_cards WHERE customer_id = ?', [customerId]);
  let creditFactor = 0;
  for (const card of cards) {
    const pct = (card.used_amount / card.limit_amount) * 100;
    if (pct < 30) creditFactor += 10;
    else if (pct > 80) creditFactor -= 30;
  }
  creditFactor = Math.max(Math.min(creditFactor, 30), -100);

  const suspicious = await query(`
    SELECT COUNT(*) as cnt
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    WHERE a.customer_id = ? AND t.is_suspicious = 1
  `, [customerId]);
  const suspiciousCount = suspicious[0]?.cnt || 0;
  const missedFactor = Math.max(-60, suspiciousCount * -20);

  const raw = 700 + loanFactor + creditFactor + missedFactor;
  const score = Math.min(900, Math.max(300, raw));

  return { score, loan_repayment_factor: loanFactor, credit_usage_factor: creditFactor, missed_payments_factor: missedFactor };
}

async function getCreditScore(req, res) {
  try {
    const user = req.user;

    if (user?.role === 'admin' || user?.role === 'employee') {
      const scores = await query(`
        SELECT cs.*, c.first_name as customer_name, 'N/A' as email
        FROM credit_scores cs
        JOIN customers c ON cs.customer_id = c.id
        ORDER BY cs.score DESC
      `);
      return res.json(scores);
    }

    const customerId = user?.customer_id;
    if (!customerId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { score, loan_repayment_factor, credit_usage_factor, missed_payments_factor } = await calculateScore(customerId);

    await query(`
      INSERT INTO credit_scores (customer_id, score, loan_repayment_factor, credit_usage_factor, missed_payments_factor)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        score = VALUES(score),
        loan_repayment_factor = VALUES(loan_repayment_factor),
        credit_usage_factor = VALUES(credit_usage_factor),
        missed_payments_factor = VALUES(missed_payments_factor)
    `, [customerId, score, loan_repayment_factor, credit_usage_factor, missed_payments_factor]);

    return res.json({ score, loan_repayment_factor, credit_usage_factor, missed_payments_factor });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { getCreditScore };
