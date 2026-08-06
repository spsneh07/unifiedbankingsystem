const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { generateOTP } = require('../middleware/otpService');

/**
 * POST /api/otp/generate
 * Generate an OTP for the authenticated user.
 * In demo mode: returns the OTP so user can see it in UI.
 * In production: send via SMS/email and return only { success: true }.
 */
router.post('/generate', requireAuth, (req, res) => {
  try {
    const userId = req.user.user_id;
    const otp = generateOTP(userId);

    // DEMO MODE: return OTP so user can copy it
    // PRODUCTION: remove `otp` from response and send via SMS/email
    return res.json({
      success: true,
      otp, // Remove in production
      message: 'OTP generated. Valid for 5 minutes. (Demo: OTP shown for testing)',
      expiresIn: 300,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'OTP generation failed' });
  }
});

module.exports = router;
