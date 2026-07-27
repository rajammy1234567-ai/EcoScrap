const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllScraps,
  getScrapById,
  updateScrapStatus,
  getAllUsers,
  createAdmin,
  sendNotification,
  getAllPickups,
  getPickupDetails,
  updatePickupStatus,
  getPickupStats,
} = require("../controllers/adminController");
const {
  adminListRates,
  adminUpdateRate,
  adminUploadImage,
  adminClearImage,
  adminCreateRate,
} = require("../controllers/rateCatalogController");
const { protect, adminOnly } = require("../middlewares/auth");
const { upload } = require("../middlewares/upload");

router.use(protect, adminOnly);

router.get("/stats", getDashboardStats);
router.get("/scraps", getAllScraps);
router.get("/scraps/:id", getScrapById);
router.put("/scraps/:id/status", updateScrapStatus);
router.get("/users", getAllUsers);
router.post("/create-admin", createAdmin);
router.post("/notify", sendNotification);

// Pickup management routes
router.get("/pickups/stats", getPickupStats);
router.get("/pickups", getAllPickups);
router.get("/pickups/:id", getPickupDetails);
router.put("/pickups/:id/status", updatePickupStatus);

// Rate catalog + permanent images
router.get("/rates", adminListRates);
router.post("/rates", adminCreateRate);
router.put("/rates/:id", adminUpdateRate);
router.post(
  "/rates/:id/image",
  upload.single("image"),
  adminUploadImage,
);
router.delete("/rates/:id/image", adminClearImage);

module.exports = router;
