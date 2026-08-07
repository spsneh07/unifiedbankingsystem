const express = require('express');
const router = express.Router();
const { getCustomers, createCustomer, updateCustomer, getProfile, updateProfile } = require('../controllers/customersController');

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.get('/', getCustomers);
router.post('/', createCustomer);
router.put('/', updateCustomer);

module.exports = router;
