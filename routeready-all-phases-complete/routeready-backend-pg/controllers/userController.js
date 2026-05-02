/**
 * RouteReady — User Profile Controller (Phase 4)
 *
 * GET    /api/users/profile          — get my profile         [protected]
 * PUT    /api/users/profile          — update my profile      [protected]
 * GET    /api/users/profile/stats    — my travel stats        [protected]
 * DELETE /api/users/account          — delete my account      [protected]
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── GET MY PROFILE ────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: {
          select: {
            savedDestinations: true,
            reviews:           true,
            itineraries:       true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Strip password hash
    const { pwHash, ...safeUser } = user;

    res.status(200).json({ success: true, data: safeUser });
  } catch (err) {
    console.error('getProfile error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── UPDATE MY PROFILE ─────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      avatar,
      budgetRange,
      interests,
      travelStyle,
      isStudent,
    } = req.body;

    // Build update object — only update fields that were sent
    const data = {};
    if (name        !== undefined) data.name        = name.trim();
    if (phone       !== undefined) data.phone       = phone.trim();
    if (avatar      !== undefined) data.avatar      = avatar.trim();
    if (budgetRange !== undefined) data.budgetRange = budgetRange;
    if (interests   !== undefined) data.interests   = interests;
    if (travelStyle !== undefined) data.travelStyle = travelStyle;
    if (isStudent   !== undefined) data.isStudent   = Boolean(isStudent);

    // Validate name if provided
    if (data.name !== undefined && data.name.length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
    }

    // Validate budgetRange
    const validBudgets = ['low', 'medium', 'high', 'luxury'];
    if (data.budgetRange && !validBudgets.includes(data.budgetRange)) {
      return res.status(400).json({ success: false, message: 'budgetRange must be: low, medium, high, or luxury.' });
    }

    // Validate travelStyle
    const validStyles = ['solo', 'couple', 'family', 'group', 'backpacker'];
    if (data.travelStyle && !validStyles.includes(data.travelStyle)) {
      return res.status(400).json({ success: false, message: 'travelStyle must be: solo, couple, family, group, or backpacker.' });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    const { pwHash, ...safeUser } = updated;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data:    safeUser,
    });
  } catch (err) {
    console.error('updateProfile error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET MY TRAVEL STATS ───────────────────────────────────────
const getProfileStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      savedCount,
      reviewCount,
      itineraryCount,
      recentSaved,
      recentReviews,
    ] = await Promise.all([
      prisma.userSavedDestination.count({ where: { userId } }),
      prisma.review.count({ where: { userId } }),
      prisma.itinerary.count({ where: { userId } }),
      prisma.userSavedDestination.findMany({
        where:   { userId },
        take:    5,
        orderBy: { savedAt: 'desc' },
        include: { destination: { select: { name: true, city: true, image: true, rating: true } } },
      }),
      prisma.review.findMany({
        where:   { userId },
        take:    5,
        orderBy: { createdAt: 'desc' },
        include: { destination: { select: { name: true, city: true } } },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        savedCount,
        reviewCount,
        itineraryCount,
        recentSaved:   recentSaved.map((s) => s.destination),
        recentReviews,
      },
    });
  } catch (err) {
    console.error('getProfileStats error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── DELETE ACCOUNT ────────────────────────────────────────────
const deleteAccount = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully. We are sorry to see you go.',
    });
  } catch (err) {
    console.error('deleteAccount error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getProfile, updateProfile, getProfileStats, deleteAccount };
