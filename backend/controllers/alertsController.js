const { query } = require('../db/connection');

async function getAlerts(req, res) {
  try {
    const user = req.user;
    const customerId = user?.customer_id;

    if (!customerId) return res.json({ success: true, data: [], unreadCount: 0 });

    const alerts = await query(`
      SELECT * FROM alerts 
      WHERE customer_id = ?
      ORDER BY created_at DESC
    `, [customerId]);

    const [countResult] = await query(`
      SELECT COUNT(*) as count FROM alerts WHERE customer_id = ? AND is_read = FALSE
    `, [customerId]);

    return res.json({
      success: true,
      data: alerts,
      unreadCount: countResult?.count || 0
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function markAlertsRead(req, res) {
  try {
    const { id } = req.body || {};
    const user = req.user;
    const customerId = user?.customer_id;

    if (!customerId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    if (id) {
      await query(`UPDATE alerts SET is_read = TRUE WHERE alert_id = ? AND customer_id = ?`, [id, customerId]);
    } else {
      await query(`UPDATE alerts SET is_read = TRUE WHERE customer_id = ?`, [customerId]);
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { getAlerts, markAlertsRead };
