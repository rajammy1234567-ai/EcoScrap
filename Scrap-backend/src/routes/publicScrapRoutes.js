const express = require("express");
const router = express.Router();
const {
  getCategories,
  getItems,
} = require("../controllers/publicScrapController");

router.get("/categories", getCategories);
router.get("/categories/:id/items", getItems);

module.exports = router;
