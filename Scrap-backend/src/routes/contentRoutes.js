const express = require("express");
const router = express.Router();
const {
  getHomeContent,
  listHappyCustomers,
  createHappyCustomer,
} = require("../controllers/contentController");
const { protect } = require("../middlewares/auth");

// Public
router.get("/home", getHomeContent);
router.get("/happy-customers", listHappyCustomers);

// Scrapper — after pickup
router.post("/happy-customers", protect, createHappyCustomer);

module.exports = router;
