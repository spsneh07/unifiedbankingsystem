const express = require('express');
const router = express.Router();
const { getCustomers, createCustomer, updateCustomer } = require('../controllers/customersController');

router.get('/', getCustomers);
router.post('/', createCustomer);
router.put('/', updateCustomer);

module.exports = router;
