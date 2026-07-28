const express = require("express");
const router = express.Router();
const {
  applyAsScrapper,
  getMyApplication,
  getMyWallet,
  listScrapperJobs,
  acceptJob,
  completeJob,
  completeAndPay,
} = require("../controllers/scrapperController");
const { protect } = require("../middlewares/auth");
const { kycUpload } = require("../middlewares/upload");

router.use(protect);

const kycFields = kycUpload.fields([
  { name: "aadhaarFront", maxCount: 1 },
  { name: "aadhaarBack", maxCount: 1 },
  { name: "panCard", maxCount: 1 },
  { name: "selfie", maxCount: 1 },
  { name: "cancelledCheque", maxCount: 1 },
]);

router.post("/apply", kycFields, applyAsScrapper);
router.get("/my-application", getMyApplication);
router.get("/wallet", getMyWallet);
router.get("/jobs", listScrapperJobs);
router.put("/jobs/:id/accept", acceptJob);
router.put("/jobs/:id/complete", completeJob);
router.put("/jobs/:id/complete-and-pay", completeAndPay);

module.exports = router;
