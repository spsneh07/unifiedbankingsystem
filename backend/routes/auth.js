const express = require('express');
const router = express.Router();
const {
  login,
  signup,
  logout,
  forgotPassword,
  resetPassword,
  loginValidation,
  signupValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/login', loginValidation, login);
router.post('/signup', signupValidation, signup);
router.post('/logout', logout);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);

// Get current session info
router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.user_id,
      email: req.user.email,
      role: req.user.role,
      customer_id: req.user.customer_id,
    },
  });
});

module.exports = router;
