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
const {
  adminUpdateDemoVideo,
  adminGetDemoVideo,
  adminListHappyCustomers,
  adminCreateHappyCustomer,
  adminDeleteHappyCustomer,
  adminSeedHappyCustomers,
} = require("../controllers/contentController");
const { protect, adminOnly } = require("../middlewares/auth");
const { upload, videoUpload } = require("../middlewares/upload");

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

// Demo video for mobile home (URL and/or gallery file upload)
router.get("/demo-video", adminGetDemoVideo);
router.put(
  "/demo-video",
  (req, res, next) => {
    videoUpload.single("video")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Video upload failed",
        });
      }
      next();
    });
  },
  adminUpdateDemoVideo,
);

// Happy customers — admin manage (sample + add/delete)
router.get("/happy-customers", adminListHappyCustomers);
router.post(
  "/happy-customers",
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Image upload failed",
        });
      }
      next();
    });
  },
  adminCreateHappyCustomer,
);
router.delete("/happy-customers/:id", adminDeleteHappyCustomer);
router.post("/happy-customers/seed", adminSeedHappyCustomers);

module.exports = router;
