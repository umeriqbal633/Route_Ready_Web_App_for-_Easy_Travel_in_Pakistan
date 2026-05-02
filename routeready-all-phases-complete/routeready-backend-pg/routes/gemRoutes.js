/**
 * RouteReady — Hidden Gems Routes (Phase 3)
 */
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllGems,
  getGemById,
  getGemsByCity,
  upvoteGem,
  getGemStats,
} = require('../controllers/gemController');

// Public
router.get('/',           getAllGems);
router.get('/stats',      getGemStats);
router.get('/city/:city', getGemsByCity);
router.get('/:id',        getGemById);

// Protected
router.post('/:id/upvote', protect, upvoteGem);

module.exports = router;
