/**
 * RouteReady — User Profile Routes (Phase 4)
 */
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  getProfileStats,
  deleteAccount,
} = require('../controllers/userController');

// All routes are protected
router.get('/',        protect, getProfile);
router.put('/',        protect, updateProfile);
router.get('/stats',   protect, getProfileStats);
router.delete('/account', protect, deleteAccount);

module.exports = router;
