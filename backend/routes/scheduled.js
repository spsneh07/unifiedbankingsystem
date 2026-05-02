const express = require('express');
const router = express.Router();
const { getScheduled, manageScheduled } = require('../controllers/scheduledController');

router.get('/', getScheduled);
router.post('/', manageScheduled);

module.exports = router;
