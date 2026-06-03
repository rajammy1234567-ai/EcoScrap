const express = require("express");
const router = express.Router();
const {
  createPickup,
  getPickup,
  listPickups,
} = require("../controllers/pickupController");
const { protect } = require("../middlewares/auth");

// Allow unauthenticated creation and listing for quick scheduling from app.
// Protect detail GET to ensure privacy.
router.post("/", createPickup);
router.get("/:id", protect, getPickup);
router.get("/", listPickups);

module.exports = router;
