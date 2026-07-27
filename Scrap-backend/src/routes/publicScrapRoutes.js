const express = require("express");
const router = express.Router();
const {
  getCategories,
  getItems,
  getRateCard,
} = require("../controllers/publicScrapController");

router.get("/categories", getCategories);
router.get("/categories/:id/items", getItems);
router.get("/rate-card", getRateCard);

module.exports = router;
