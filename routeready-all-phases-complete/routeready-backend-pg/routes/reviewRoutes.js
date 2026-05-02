/**
 * RouteReady — Review Routes (Phase 4)
 */
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getReviewsByDestination,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  getMyReviews,
} = require('../controllers/reviewController');

// Public
router.get('/destination/:destId', getReviewsByDestination);

// Protected
router.get('/mine',         protect, getMyReviews);
router.post('/',            protect, createReview);
router.put('/:id',          protect, updateReview);
router.delete('/:id',       protect, deleteReview);
router.post('/:id/helpful', protect, markHelpful);

module.exports = router;
