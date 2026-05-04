const express = require('express');
const { generateItinerary } = require('../controllers/itinerary.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/generate', protect, generateItinerary);

module.exports = router;
