const { query } = require('../db/connection');

async function getLoans(req, res) {
  try {
    const user = req.user;
    const role = user?.role;

    if (role === 'admin' || role === 'employee') {
      const loans = await query(`
        SELECT l.*, c.first_name as customer_name, 'N/A' as customer_email
        FROM loans l
        LEFT JOIN customers c ON l.customer_id = c.id
        ORDER BY l.created_at DESC
      `);
      return res.json(loans);
    }

    let customerId = req.query.customerId || user?.customer_id;
    if (!customerId) return res.json([]);

    const loans = await query('SELECT * FROM loans WHERE customer_id = ? ORDER BY created_at DESC', [customerId]);
    return res.json(loans);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function manageLoan(req, res) {
  try {
    const { action, loan_id, amount, tenure, interest_rate } = req.body;
    const user = req.user;

    if (action === 'apply') {
      const customerId = user?.customer_id;
      if (!customerId) return res.status(401).json({ success: false, error: 'Customer session not found' });

      if (!amount || !tenure || !interest_rate) {
        return res.status(400).json({ success: false, error: 'Missing parameters' });
      }

      const P = amount;
      const R = (interest_rate / 100) / 12;
      const N = tenure;
      const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);

      await query(
        'INSERT INTO loans (customer_id, amount, interest_rate, tenure, emi, status) VALUES (?, ?, ?, ?, ?, "pending")',
        [customerId, amount, interest_rate, tenure, emi]
      );
      return res.json({ success: true, message: 'Loan application submitted successfully' });
    } else if (action === 'approve' || action === 'reject') {
      if (user?.role !== 'admin' && user?.role !== 'employee') {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
      }
      if (!loan_id) return res.status(400).json({ success: false, error: 'Missing loan_id' });

      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      await query('UPDATE loans SET status = ? WHERE id = ?', [newStatus, loan_id]);
      return res.json({ success: true, message: `Loan ${newStatus} successfully` });
    }

    return res.status(400).json({ success: false, error: 'Invalid action' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { getLoans, manageLoan };
