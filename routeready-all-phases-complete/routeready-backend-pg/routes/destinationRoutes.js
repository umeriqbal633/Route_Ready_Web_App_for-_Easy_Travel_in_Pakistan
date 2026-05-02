/**
 * RouteReady — Destination Routes (Phase 3)
 */
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllDestinations,
  getDestinationById,
  getDestinationsByCity,
  saveDestination,
  unsaveDestination,
  getSavedDestinations,
  getDestinationStats,
} = require('../controllers/destinationController');

// Public
router.get('/',              getAllDestinations);
router.get('/stats',         getDestinationStats);
router.get('/city/:city',    getDestinationsByCity);
router.get('/:id',           getDestinationById);

// Protected
router.get('/user/saved',    protect, getSavedDestinations);
router.post('/:id/save',     protect, saveDestination);
router.delete('/:id/save',   protect, unsaveDestination);

module.exports = router;
