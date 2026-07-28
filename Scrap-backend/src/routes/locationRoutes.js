const express = require("express");
const router = express.Router();
const {
  checkService,
  notifyMe,
  updateLocation,
  getMyLocation,
} = require("../controllers/locationController");
const { protect } = require("../middlewares/auth");

router.post("/check-service", checkService);
router.post("/notify-me", notifyMe);

router.put("/update", protect, updateLocation);
router.get("/me", protect, getMyLocation);

module.exports = router;
