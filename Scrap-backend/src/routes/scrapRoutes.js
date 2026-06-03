const express = require('express');
const router = express.Router();
const { createScrap, getUserScraps, getScrapById, updateScrap, deleteScrap } = require('../controllers/scrapController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.post('/', createScrap);
router.get('/', getUserScraps);
router.get('/:id', getScrapById);
router.put('/:id', updateScrap);
router.delete('/:id', deleteScrap);

module.exports = router;
