/**
 * RouteReady — Auth Routes (Phase 2)
 *
 * POST   /api/auth/register   — create account
 * POST   /api/auth/login      — sign in
 * GET    /api/auth/me         — get logged-in user  [protected]
 * POST   /api/auth/logout     — sign out            [protected]
 * PUT    /api/auth/password   — change password     [protected]
 */

const express = require('express');
const router = express.Router();

const { register, login, getMe, logout, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        protect, getMe);
router.post('/logout',   protect, logout);
router.put('/password',  protect, changePassword);

module.exports = router;
