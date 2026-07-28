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
  adminListApplications,
  adminGetApplication,
  adminReviewApplication,
  adminListScrappers,
  adminAssignScrapper,
  adminWalletOverview,
  adminWalletTransactions,
  adminTopupWallet,
  adminListPayouts,
} = require("../controllers/scrapperController");
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
router.put("/pickups/:id/assign-scrapper", adminAssignScrapper);

// Scrapper applications + KYC
router.get("/scrapper-applications", adminListApplications);
router.get("/scrapper-applications/:id", adminGetApplication);
router.put("/scrapper-applications/:id/review", adminReviewApplication);
router.get("/scrapers", adminListScrappers);

// Wallet / ledger / payouts (admin money control)
router.get("/wallets", adminWalletOverview);
router.get("/wallet-transactions", adminWalletTransactions);
router.post("/wallets/topup", adminTopupWallet);
router.get("/payouts", adminListPayouts);

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
