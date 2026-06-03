const express = require("express");
const router = express.Router();
const { checkService, notifyMe } = require("../controllers/locationController");

router.post("/check-service", checkService);
router.post("/notify-me", notifyMe);

module.exports = router;
