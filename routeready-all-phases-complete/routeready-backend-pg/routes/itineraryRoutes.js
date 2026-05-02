/**
 * RouteReady — Itinerary Routes (Phase 5)
 * All routes are protected (require login)
 */
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  generate,
  getMyItineraries,
  getItineraryById,
  updateItinerary,
  deleteItinerary,
} = require('../controllers/itineraryController');

router.post('/generate', protect, generate);
router.get('/',          protect, getMyItineraries);
router.get('/:id',       protect, getItineraryById);
router.put('/:id',       protect, updateItinerary);
router.delete('/:id',    protect, deleteItinerary);

module.exports = router;
