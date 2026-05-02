const express = require('express');
const router = express.Router();
const { getAlerts, markAlertsRead } = require('../controllers/alertsController');

router.get('/', getAlerts);
router.patch('/', markAlertsRead);

module.exports = router;
