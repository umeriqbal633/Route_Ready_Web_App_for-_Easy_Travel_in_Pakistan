/**
 * RouteReady — Auth Controller (Phase 2)
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me
 * POST /api/auth/logout
 * PUT  /api/auth/password
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── helpers ──────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

const safeUser = (user) => ({
  id:          user.id,
  name:        user.name,
  email:       user.email,
  role:        user.role,
  avatar:      user.avatar,
  phone:       user.phone,
  isStudent:   user.isStudent,
  travelStyle: user.travelStyle,
  interests:   user.interests,
  budgetRange: user.budgetRange,
  joinDate:    user.joinDate,
  lastLogin:   user.lastLogin,
});

// ── REGISTER ─────────────────────────────────────────────────
// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, isStudent } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters.',
      });
    }

    // Check duplicate email
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Hash password (12 rounds)
    const pwHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name:      name.trim(),
        email:     email.toLowerCase().trim(),
        pwHash,
        isStudent: isStudent === true || isStudent === 'true',
      },
    });

    const token = signToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to RouteReady.',
      token,
      user: safeUser(user),
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────
// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Find user (include pwHash for comparison)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.pwHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Update lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data:  { lastLogin: new Date() },
    });

    const token = signToken(user.id);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: safeUser(user),
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ── ME ────────────────────────────────────────────────────────
// GET /api/auth/me   (protected)
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── LOGOUT ────────────────────────────────────────────────────
// POST /api/auth/logout  (protected)
// JWT is stateless — client must delete the token.
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully. Please delete your token on the client.',
  });
};

// ── CHANGE PASSWORD ───────────────────────────────────────────
// PUT /api/auth/password  (protected)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters.',
      });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isMatch = await bcrypt.compare(currentPassword, user.pwHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    const pwHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { pwHash } });

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { register, login, getMe, logout, changePassword };
