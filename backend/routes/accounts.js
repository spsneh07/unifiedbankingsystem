const express = require('express');
const router = express.Router();
const { getAccounts, createAccount } = require('../controllers/accountsController');

router.get('/', getAccounts);
router.post('/', createAccount);

module.exports = router;
