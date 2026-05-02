/**
 * RouteReady — Hotels Controller (Phase 3)
 *
 * GET  /api/hotels              — list all (with filters)
 * GET  /api/hotels/:id          — single hotel
 * GET  /api/hotels/city/:city   — hotels by city
 * GET  /api/hotels/student      — student-friendly hotels
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── GET ALL ───────────────────────────────────────────────────
const getAllHotels = async (req, res) => {
  try {
    const {
      city,
      stars,
      minPrice,
      maxPrice,
      propertyType,
      studentFriendly,
      amenity,
      search,
      page  = 1,
      limit = 20,
      sortBy = 'rating',
      order  = 'desc',
    } = req.query;

    const where = { isAvailable: true };

    if (city)         where.city         = { contains: city,         mode: 'insensitive' };
    if (propertyType) where.propertyType = { contains: propertyType, mode: 'insensitive' };
    if (stars)        where.stars        = parseInt(stars);
    if (studentFriendly === 'true') where.isStudentFriendly = true;
    if (search)       where.name         = { contains: search, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.pricePerNight = {};
      if (minPrice) where.pricePerNight.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerNight.lte = parseFloat(maxPrice);
    }
    if (amenity) where.amenities = { has: amenity };

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const take  = parseInt(limit);
    const allowedSort = ['rating', 'pricePerNight', 'stars', 'name', 'createdAt'];
    const sortField   = allowedSort.includes(sortBy) ? sortBy : 'rating';

    const [data, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        orderBy: { [sortField]: order === 'asc' ? 'asc' : 'desc' },
        skip,
        take,
      }),
      prisma.hotel.count({ where }),
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
    console.error('getAllHotels error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET ONE ───────────────────────────────────────────────────
const getHotelById = async (req, res) => {
  try {
    const hotel = await prisma.hotel.findUnique({ where: { id: req.params.id } });

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    res.status(200).json({ success: true, data: hotel });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET BY CITY ───────────────────────────────────────────────
const getHotelsByCity = async (req, res) => {
  try {
    const data = await prisma.hotel.findMany({
      where:   { city: { contains: req.params.city, mode: 'insensitive' }, isAvailable: true },
      orderBy: { rating: 'desc' },
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET STUDENT FRIENDLY ──────────────────────────────────────
const getStudentHotels = async (req, res) => {
  try {
    const { city } = req.query;
    const where = { isStudentFriendly: true, isAvailable: true };
    if (city) where.city = { contains: city, mode: 'insensitive' };

    const data = await prisma.hotel.findMany({
      where,
      orderBy: { pricePerNight: 'asc' },
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET STATS ─────────────────────────────────────────────────
const getHotelStats = async (req, res) => {
  try {
    const [cities, types, total] = await Promise.all([
      prisma.hotel.groupBy({ by: ['city'],         _count: { city: true },         orderBy: { _count: { city: 'desc' } }, take: 10 }),
      prisma.hotel.groupBy({ by: ['propertyType'], _count: { propertyType: true }, orderBy: { _count: { propertyType: 'desc' } } }),
      prisma.hotel.count(),
    ]);

    res.status(200).json({ success: true, data: { total, cities, types } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllHotels, getHotelById, getHotelsByCity, getStudentHotels, getHotelStats };
