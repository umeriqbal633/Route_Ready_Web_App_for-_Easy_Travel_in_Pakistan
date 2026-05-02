/**
 * RouteReady — Hidden Gems Controller (Phase 3)
 *
 * GET  /api/gems              — list all (with filters)
 * GET  /api/gems/:id          — single gem
 * GET  /api/gems/city/:city   — gems by city
 * POST /api/gems/:id/upvote   — upvote a gem  [protected]
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── GET ALL ───────────────────────────────────────────────────
const getAllGems = async (req, res) => {
  try {
    const {
      city,
      rarity,
      category,
      search,
      maxCost,
      page  = 1,
      limit = 20,
      sortBy = 'localsPercent',
      order  = 'desc',
    } = req.query;

    const where = { verificationStatus: 'VERIFIED' };

    if (city)     where.city     = { contains: city,     mode: 'insensitive' };
    if (category) where.category = { contains: category, mode: 'insensitive' };
    if (rarity)   where.rarity   = rarity.toUpperCase();
    if (search)   where.OR = [
      { name:        { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { city:        { contains: search, mode: 'insensitive' } },
    ];
    if (maxCost) where.estimatedCost = { lte: parseFloat(maxCost) };

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const take  = parseInt(limit);
    const allowedSort = ['localsPercent', 'upvotes', 'estimatedCost', 'createdAt'];
    const sortField   = allowedSort.includes(sortBy) ? sortBy : 'localsPercent';

    const [data, total] = await Promise.all([
      prisma.hiddenGem.findMany({
        where,
        orderBy: { [sortField]: order === 'asc' ? 'asc' : 'desc' },
        skip,
        take,
        include: { submittedBy: { select: { name: true } } },
      }),
      prisma.hiddenGem.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      count: data.length,
      total,
      page:  parseInt(page),
      pages: Math.ceil(total / take),
      data,
    });
  } catch (err) {
    console.error('getAllGems error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET ONE ───────────────────────────────────────────────────
const getGemById = async (req, res) => {
  try {
    const gem = await prisma.hiddenGem.findUnique({
      where:   { id: req.params.id },
      include: { submittedBy: { select: { name: true, avatar: true } } },
    });

    if (!gem) {
      return res.status(404).json({ success: false, message: 'Hidden gem not found.' });
    }

    // Increment view count
    await prisma.hiddenGem.update({
      where: { id: req.params.id },
      data:  { viewCount: { increment: 1 } },
    });

    res.status(200).json({ success: true, data: gem });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET BY CITY ───────────────────────────────────────────────
const getGemsByCity = async (req, res) => {
  try {
    const data = await prisma.hiddenGem.findMany({
      where:   { city: { contains: req.params.city, mode: 'insensitive' }, verificationStatus: 'VERIFIED' },
      orderBy: { localsPercent: 'desc' },
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── UPVOTE GEM (protected) ────────────────────────────────────
const upvoteGem = async (req, res) => {
  try {
    const gem = await prisma.hiddenGem.findUnique({ where: { id: req.params.id } });

    if (!gem) {
      return res.status(404).json({ success: false, message: 'Hidden gem not found.' });
    }

    const updated = await prisma.hiddenGem.update({
      where: { id: req.params.id },
      data:  { upvotes: { increment: 1 } },
    });

    res.status(200).json({ success: true, message: 'Upvoted!', upvotes: updated.upvotes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET STATS ─────────────────────────────────────────────────
const getGemStats = async (req, res) => {
  try {
    const [rarities, categories, cities, total] = await Promise.all([
      prisma.hiddenGem.groupBy({ by: ['rarity'],   _count: { rarity: true },   orderBy: { _count: { rarity: 'desc' } } }),
      prisma.hiddenGem.groupBy({ by: ['category'], _count: { category: true }, orderBy: { _count: { category: 'desc' } } }),
      prisma.hiddenGem.groupBy({ by: ['city'],     _count: { city: true },     orderBy: { _count: { city: 'desc' } }, take: 10 }),
      prisma.hiddenGem.count(),
    ]);

    res.status(200).json({ success: true, data: { total, rarities, categories, cities } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllGems, getGemById, getGemsByCity, upvoteGem, getGemStats };
