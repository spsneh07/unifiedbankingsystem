const express = require('express');
const router = express.Router();
const { getLoans, manageLoan } = require('../controllers/loansController');

router.get('/', getLoans);
router.post('/', manageLoan);

module.exports = router;
