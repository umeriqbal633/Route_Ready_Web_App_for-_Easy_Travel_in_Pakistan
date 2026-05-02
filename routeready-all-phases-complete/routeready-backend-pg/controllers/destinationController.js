/**
 * RouteReady — Destinations Controller (Phase 3)
 *
 * GET    /api/destinations              — list all (with filters)
 * GET    /api/destinations/:id          — single destination
 * GET    /api/destinations/city/:city   — by city
 * POST   /api/destinations/:id/save     — save destination     [protected]
 * DELETE /api/destinations/:id/save     — unsave destination   [protected]
 * GET    /api/destinations/saved        — get user saved list  [protected]
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── GET ALL — with filters, search, pagination ────────────────
const getAllDestinations = async (req, res) => {
  try {
    const {
      city,
      province,
      category,
      search,
      minRating,
      maxPrice,
      badge,
      page = 1,
      limit = 20,
      sortBy = 'rating',
      order = 'desc',
    } = req.query;

    const where = {};

    if (city)      where.city     = { contains: city,     mode: 'insensitive' };
    if (province)  where.province = { contains: province, mode: 'insensitive' };
    if (category)  where.category = { contains: category, mode: 'insensitive' };
    if (badge)     where.badge    = { contains: badge,    mode: 'insensitive' };
    if (search)    where.OR = [
      { name:             { contains: search, mode: 'insensitive' } },
      { shortDescription: { contains: search, mode: 'insensitive' } },
      { city:             { contains: search, mode: 'insensitive' } },
    ];
    if (minRating) where.rating    = { gte: parseFloat(minRating) };
    if (maxPrice)  where.price     = { lte: parseFloat(maxPrice) };

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const take  = parseInt(limit);
    const allowedSort = ['rating', 'price', 'name', 'reviewCount', 'saveCount', 'createdAt'];
    const sortField   = allowedSort.includes(sortBy) ? sortBy : 'rating';

    const [data, total] = await Promise.all([
      prisma.destination.findMany({
        where,
        orderBy: { [sortField]: order === 'asc' ? 'asc' : 'desc' },
        skip,
        take,
      }),
      prisma.destination.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      count:   data.length,
      total,
      page:    parseInt(page),
      pages:   Math.ceil(total / take),
      data,
    });
  } catch (err) {
    console.error('getAllDestinations error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET ONE ───────────────────────────────────────────────────
const getDestinationById = async (req, res) => {
  try {
    const destination = await prisma.destination.findUnique({
      where: { id: req.params.id },
      include: {
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, avatar: true } } },
        },
        _count: { select: { savedBy: true, reviews: true } },
      },
    });

    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found.' });
    }

    // Increment view count
    await prisma.destination.update({
      where: { id: req.params.id },
      data:  { viewCount: { increment: 1 } },
    });

    res.status(200).json({ success: true, data: destination });
  } catch (err) {
    console.error('getDestinationById error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET BY CITY ───────────────────────────────────────────────
const getDestinationsByCity = async (req, res) => {
  try {
    const data = await prisma.destination.findMany({
      where:   { city: { contains: req.params.city, mode: 'insensitive' } },
      orderBy: { rating: 'desc' },
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── SAVE DESTINATION (protected) ─────────────────────────────
const saveDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const destination = await prisma.destination.findUnique({ where: { id } });
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found.' });
    }

    // Check if already saved
    const existing = await prisma.userSavedDestination.findUnique({
      where: { userId_destinationId: { userId, destinationId: id } },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Already saved.' });
    }

    await prisma.userSavedDestination.create({
      data: { userId, destinationId: id },
    });

    await prisma.destination.update({
      where: { id },
      data:  { saveCount: { increment: 1 } },
    });

    res.status(201).json({ success: true, message: 'Destination saved successfully.' });
  } catch (err) {
    console.error('saveDestination error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── UNSAVE DESTINATION (protected) ───────────────────────────
const unsaveDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.userSavedDestination.findUnique({
      where: { userId_destinationId: { userId, destinationId: id } },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Not saved.' });
    }

    await prisma.userSavedDestination.delete({
      where: { userId_destinationId: { userId, destinationId: id } },
    });

    await prisma.destination.update({
      where: { id },
      data:  { saveCount: { decrement: 1 } },
    });

    res.status(200).json({ success: true, message: 'Destination removed from saved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET SAVED (protected) ─────────────────────────────────────
const getSavedDestinations = async (req, res) => {
  try {
    const saved = await prisma.userSavedDestination.findMany({
      where:   { userId: req.user.id },
      orderBy: { savedAt: 'desc' },
      include: { destination: true },
    });

    const data = saved.map((s) => s.destination);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET STATS (categories, cities, provinces) ─────────────────
const getDestinationStats = async (req, res) => {
  try {
    const [categories, cities, provinces, total] = await Promise.all([
      prisma.destination.groupBy({ by: ['category'], _count: { category: true }, orderBy: { _count: { category: 'desc' } } }),
      prisma.destination.groupBy({ by: ['city'],     _count: { city: true },     orderBy: { _count: { city: 'desc' } }, take: 10 }),
      prisma.destination.groupBy({ by: ['province'], _count: { province: true }, orderBy: { _count: { province: 'desc' } } }),
      prisma.destination.count(),
    ]);

    res.status(200).json({
      success: true,
      data: { total, categories, cities, provinces },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getAllDestinations,
  getDestinationById,
  getDestinationsByCity,
  saveDestination,
  unsaveDestination,
  getSavedDestinations,
  getDestinationStats,
};
