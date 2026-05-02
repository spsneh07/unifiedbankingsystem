const express = require('express');
const router = express.Router();
const { getCreditCards, manageCreditCard } = require('../controllers/creditCardsController');

router.get('/', getCreditCards);
router.post('/', manageCreditCard);

module.exports = router;
