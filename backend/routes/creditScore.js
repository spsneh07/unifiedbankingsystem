const express = require('express');
const router = express.Router();
const { getCreditScore } = require('../controllers/creditScoreController');

router.get('/', getCreditScore);

module.exports = router;
