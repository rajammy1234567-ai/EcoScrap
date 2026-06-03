const express = require("express");
const router = express.Router();
const {
  createPickup,
  getPickup,
  listPickups,
  cancelPickup,
} = require("../controllers/pickupController");
const { protect } = require("../middlewares/auth");

// All pickup operations require authentication now so pickups are always tied to a user.
router.post("/", protect, createPickup);
router.get("/:id", protect, getPickup);
router.put("/:id/cancel", protect, cancelPickup);
router.get("/", protect, listPickups);

module.exports = router;
