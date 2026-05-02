/**
 * RouteReady — Hotel Routes (Phase 3)
 */
const express = require('express');
const router  = express.Router();
const {
  getAllHotels,
  getHotelById,
  getHotelsByCity,
  getStudentHotels,
  getHotelStats,
} = require('../controllers/hotelController');

router.get('/',            getAllHotels);
router.get('/stats',       getHotelStats);
router.get('/student',     getStudentHotels);
router.get('/city/:city',  getHotelsByCity);
router.get('/:id',         getHotelById);

module.exports = router;
