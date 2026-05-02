const { query } = require('../db/connection');

async function getBranches(req, res) {
  try {
    const branches = await query('SELECT * FROM branches ORDER BY name ASC');
    return res.json(branches);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { getBranches };
