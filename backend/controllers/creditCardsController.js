const { query } = require('../db/connection');

async function getCreditCards(req, res) {
  try {
    const customerId = req.query.customerId || req.user?.customer_id;
    if (!customerId) return res.json([]);

    const cards = await query(`SELECT * FROM credit_cards WHERE customer_id = ? ORDER BY id DESC`, [customerId]);
    return res.json(cards);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function manageCreditCard(req, res) {
  try {
    const { action, card_id, amount, otp } = req.body;
    const user = req.user;
    const auditUserId = user?.user_id || 1;

    if (action !== 'apply' && (!action || !card_id || typeof amount !== 'number')) {
      return res.status(400).json({ success: false, error: 'Invalid parameters' });
    }

    if (action === 'spend' || action === 'pay') {
      if (!otp) return res.status(403).json({ success: false, error: 'OTP verification required', requireOTP: true });

      await new Promise(resolve => setTimeout(resolve, 1500));

      const cards = await query('SELECT limit_amount, used_amount FROM credit_cards WHERE id = ?', [card_id]);
      if (!cards.length) return res.status(404).json({ success: false, error: 'Card not found' });

      const card = cards[0];
      const refId = 'CC-' + Date.now() + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const mockAvgAmount = 5000;
      let isSuspicious = amount > (3 * mockAvgAmount) ? 1 : 0;

      if (action === 'spend') {
        if (Number(card.used_amount) + amount > Number(card.limit_amount)) {
          await query('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)', [auditUserId, 'CC_SPEND_FAILED', `Ref: ${refId}, Amount: ${amount}, Reason: Limit exceeded`]);
          return res.status(400).json({ success: false, error: 'Credit limit exceeded' });
        }
        await query('UPDATE credit_cards SET used_amount = used_amount + ? WHERE id = ?', [amount, card_id]);
        await query('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)', [auditUserId, 'CC_SPEND_SUCCESS', `Ref: ${refId}, Amount: ${amount}, Suspicious: ${isSuspicious}`]);
        return res.json({ success: true, message: 'Spend successful', status: 'SUCCESS', reference_id: refId, is_suspicious: isSuspicious === 1 });
      } else if (action === 'pay') {
        await query('UPDATE credit_cards SET used_amount = GREATEST(used_amount - ?, 0) WHERE id = ?', [amount, card_id]);
        await query('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)', [auditUserId, 'CC_PAY_SUCCESS', `Ref: ${refId}, Amount: ${amount}`]);
        return res.json({ success: true, message: 'Payment successful', status: 'SUCCESS', reference_id: refId });
      }
    } else if (action === 'apply') {
      const customerId = user?.customer_id;
      if (!customerId) return res.status(400).json({ success: false, error: 'Customer profile not found' });

      const card_number = Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000)).join(' ');
      const limit_amount = 50000.00;
      const due_date = new Date();
      due_date.setMonth(due_date.getMonth() + 1);

      await query(
        'INSERT INTO credit_cards (customer_id, card_number, limit_amount, used_amount, due_date, status) VALUES (?, ?, ?, ?, ?, ?)',
        [customerId, card_number, limit_amount, 0, due_date, 'active']
      );
      return res.json({ success: true, message: 'Credit card application approved!' });
    }

    return res.status(400).json({ success: false, error: 'Invalid action' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { getCreditCards, manageCreditCard };
