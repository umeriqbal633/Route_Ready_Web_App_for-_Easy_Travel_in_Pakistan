/**
 * RouteReady — Reviews Controller (Phase 4)
 *
 * GET    /api/reviews/destination/:destId  — all reviews for a destination
 * POST   /api/reviews                      — create a review     [protected]
 * PUT    /api/reviews/:id                  — update my review    [protected]
 * DELETE /api/reviews/:id                  — delete my review    [protected]
 * POST   /api/reviews/:id/helpful          — mark as helpful     [protected]
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── GET REVIEWS FOR A DESTINATION ────────────────────────────
const getReviewsByDestination = async (req, res) => {
  try {
    const { destId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Check destination exists
    const destination = await prisma.destination.findUnique({ where: { id: destId } });
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found.' });
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where:   { destId, isPublished: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: { select: { name: true, avatar: true } },
        },
      }),
      prisma.review.count({ where: { destId, isPublished: true } }),
    ]);

    // Calculate average rating
    const avgResult = await prisma.review.aggregate({
      where:   { destId, isPublished: true },
      _avg:    { rating: true },
      _count:  { rating: true },
    });

    res.status(200).json({
      success: true,
      count:      reviews.length,
      total,
      page:       parseInt(page),
      pages:      Math.ceil(total / take),
      avgRating:  avgResult._avg.rating ? Math.round(avgResult._avg.rating * 10) / 10 : 0,
      totalRatings: avgResult._count.rating,
      data:       reviews,
    });
  } catch (err) {
    console.error('getReviewsByDestination error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── CREATE REVIEW ─────────────────────────────────────────────
const createReview = async (req, res) => {
  try {
    const { destId, rating, comment } = req.body;
    const userId = req.user.id;

    // Validate
    if (!destId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'destId, rating, and comment are required.',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5.',
      });
    }

    if (comment.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be at least 10 characters.',
      });
    }

    // Check destination exists
    const destination = await prisma.destination.findUnique({ where: { id: destId } });
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found.' });
    }

    // Check if already reviewed
    const existing = await prisma.review.findUnique({
      where: { userId_destId: { userId, destId } },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this destination. Use PUT to update your review.',
      });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        destId,
        rating: parseInt(rating),
        comment: comment.trim(),
      },
      include: {
        user: { select: { name: true, avatar: true } },
      },
    });

    // Update destination rating and reviewCount
    const aggResult = await prisma.review.aggregate({
      where: { destId, isPublished: true },
      _avg:  { rating: true },
      _count: { rating: true },
    });

    await prisma.destination.update({
      where: { id: destId },
      data: {
        rating:      Math.round((aggResult._avg.rating || 0) * 10) / 10,
        reviewCount: aggResult._count.rating,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data:    review,
    });
  } catch (err) {
    console.error('createReview error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── UPDATE MY REVIEW ──────────────────────────────────────────
const updateReview = async (req, res) => {
  try {
    const { id }   = req.params;
    const { rating, comment } = req.body;
    const userId   = req.user.id;

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ success: false, message: 'You can only edit your own reviews.' });
    }

    const data = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
      }
      data.rating = parseInt(rating);
    }
    if (comment !== undefined) {
      if (comment.trim().length < 10) {
        return res.status(400).json({ success: false, message: 'Comment must be at least 10 characters.' });
      }
      data.comment = comment.trim();
    }

    const updated = await prisma.review.update({
      where:   { id },
      data,
      include: { user: { select: { name: true, avatar: true } } },
    });

    // Recalculate destination rating
    const aggResult = await prisma.review.aggregate({
      where: { destId: review.destId, isPublished: true },
      _avg:  { rating: true },
      _count: { rating: true },
    });

    await prisma.destination.update({
      where: { id: review.destId },
      data: {
        rating:      Math.round((aggResult._avg.rating || 0) * 10) / 10,
        reviewCount: aggResult._count.rating,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      data:    updated,
    });
  } catch (err) {
    console.error('updateReview error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── DELETE MY REVIEW ──────────────────────────────────────────
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own reviews.' });
    }

    await prisma.review.delete({ where: { id } });

    // Recalculate destination rating
    const aggResult = await prisma.review.aggregate({
      where: { destId: review.destId, isPublished: true },
      _avg:  { rating: true },
      _count: { rating: true },
    });

    await prisma.destination.update({
      where: { id: review.destId },
      data: {
        rating:      Math.round((aggResult._avg.rating || 0) * 10) / 10,
        reviewCount: aggResult._count.rating,
      },
    });

    res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (err) {
    console.error('deleteReview error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── MARK REVIEW AS HELPFUL ────────────────────────────────────
const markHelpful = async (req, res) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data:  { helpfulCount: { increment: 1 } },
    });

    res.status(200).json({
      success: true,
      message: 'Marked as helpful.',
      helpfulCount: updated.helpfulCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET MY REVIEWS ────────────────────────────────────────────
const getMyReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { destination: { select: { name: true, city: true, image: true } } },
    });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getReviewsByDestination,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  getMyReviews,
};
