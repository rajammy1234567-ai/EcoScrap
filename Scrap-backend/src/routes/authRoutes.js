const express = require("express");
const router = express.Router();
const {
  register,
  login,
  sendOtp,
  verifyOtp,
  getMe,
  updateProfile,
  updatePushToken,
} = require("../controllers/authController");
const { protect } = require("../middlewares/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/push-token", protect, updatePushToken);

module.exports = router;
