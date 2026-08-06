/**
 * OTP Service — In-memory OTP store with TTL
 * For demo purposes: OTP is returned in the API response so users can see it.
 * In production: send via SMS/email instead of returning in response.
 */

const otpStore = new Map(); // key: userId, value: { otp, expiresAt }
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

function generateOTP(userId) {
  // Generate cryptographically random 6-digit OTP
  const otp = Math.floor(100000 + (Math.random() * 900000)).toString();
  const expiresAt = Date.now() + OTP_TTL_MS;
  otpStore.set(String(userId), { otp, expiresAt });
  return otp;
}

function validateOTP(userId, inputOtp) {
  const key = String(userId);
  const record = otpStore.get(key);

  if (!record) return { valid: false, reason: 'No OTP requested' };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return { valid: false, reason: 'OTP expired' };
  }
  if (String(inputOtp) !== String(record.otp)) {
    return { valid: false, reason: 'Invalid OTP' };
  }

  // Single-use: delete after successful validation
  otpStore.delete(key);
  return { valid: true };
}

// Clean up expired OTPs every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of otpStore.entries()) {
    if (now > record.expiresAt) otpStore.delete(key);
  }
}, 10 * 60 * 1000);

module.exports = { generateOTP, validateOTP };
