/**
 * RouteReady — Itinerary Controller (Phase 5)
 *
 * POST   /api/itineraries/generate   — AI generate itinerary   [protected]
 * GET    /api/itineraries            — get my itineraries       [protected]
 * GET    /api/itineraries/:id        — get single itinerary     [protected]
 * PUT    /api/itineraries/:id        — update notes/title       [protected]
 * DELETE /api/itineraries/:id        — delete itinerary         [protected]
 */

const { PrismaClient } = require('@prisma/client');
const { generateItinerary } = require('../services/itineraryService');

const prisma = new PrismaClient();

// ── GENERATE ITINERARY (AI) ───────────────────────────────────
const generate = async (req, res) => {
  try {
    const {
      city,
      numDays,
      startDate,
      travelerCount = 1,
      interests     = [],
      budgetRange   = 'medium',
      travelStyle   = 'solo',
      notes         = '',
    } = req.body;

    // Validation
    if (!city)      return res.status(400).json({ success: false, message: 'City is required.' });
    if (!numDays)   return res.status(400).json({ success: false, message: 'numDays is required.' });
    if (!startDate) return res.status(400).json({ success: false, message: 'startDate is required.' });
    if (numDays < 1 || numDays > 14) {
      return res.status(400).json({ success: false, message: 'numDays must be between 1 and 14.' });
    }

    const isStudent = req.user.isStudent || false;

    console.log(`\n🤖 Generating AI itinerary for ${city} (${numDays} days)...`);

    // Call Claude API
    const { itineraryData, generationTimeMs } = await generateItinerary({
      city,
      numDays,
      startDate,
      travelerCount,
      interests,
      budgetRange,
      isStudent,
      travelStyle,
      notes,
    });

    // Calculate endDate
    const start = new Date(startDate);
    const end   = new Date(start);
    end.setDate(end.getDate() + numDays - 1);

    // Save to database
    const itinerary = await prisma.itinerary.create({
      data: {
        userId:             req.user.id,
        title:              itineraryData.title,
        city:               itineraryData.city || city,
        startDate:          start,
        endDate:            end,
        numDays:            itineraryData.numDays || numDays,
        travelerCount,
        interests,
        budgetTotal:        itineraryData.estimatedTotalCost || 0,
        isStudent,
        status:             'DRAFT',
        generatedByAI:      true,
        aiModel:            'gemini-1.5-flash',
        generationTimeMs,
        estimatedTotalCost: itineraryData.estimatedTotalCost || 0,
        notes:              notes || itineraryData.summary || '',

        // Create nested days + activities
        days: {
          create: itineraryData.days.map((day) => ({
            dayNumber:     day.dayNumber,
            title:         day.title || `Day ${day.dayNumber}`,
            estimatedCost: day.estimatedCost || 0,
            activities: {
              create: day.activities.map((act) => ({
                slot:        act.slot        || 'morning',
                name:        act.name,
                description: act.description || '',
                location:    act.location    || '',
                duration:    act.duration    || '2 hours',
                cost:        act.cost        || 0,
                category:    act.category    || 'Sightseeing',
                order:       act.order       || 0,
              })),
            },
          })),
        },
      },
      include: {
        days: {
          orderBy: { dayNumber: 'asc' },
          include: { activities: { orderBy: { order: 'asc' } } },
        },
      },
    });

    console.log(`✅ Itinerary generated in ${generationTimeMs}ms`);

    res.status(201).json({
      success: true,
      message: `${numDays}-day itinerary for ${city} generated successfully!`,
      generationTimeMs,
      extras: {
        tips:            itineraryData.tips           || [],
        bestTimeToVisit: itineraryData.bestTimeToVisit || '',
        localPhrases:    itineraryData.localPhrases    || [],
        summary:         itineraryData.summary         || '',
      },
      data: itinerary,
    });
  } catch (err) {
    console.error('AI generate error:', err.message);
    if (err.message.includes('API')) {
      return res.status(503).json({
        success: false,
        message: 'AI service is temporarily unavailable. Please try again.',
      });
    }
    res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
};

// ── GET MY ITINERARIES ────────────────────────────────────────
const getMyItineraries = async (req, res) => {
  try {
    const itineraries = await prisma.itinerary.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        days: {
          orderBy: { dayNumber: 'asc' },
          include: { activities: { orderBy: { order: 'asc' } } },
        },
        _count: { select: { days: true } },
      },
    });

    res.status(200).json({ success: true, count: itineraries.length, data: itineraries });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET ONE ITINERARY ─────────────────────────────────────────
const getItineraryById = async (req, res) => {
  try {
    const itinerary = await prisma.itinerary.findUnique({
      where:   { id: req.params.id },
      include: {
        days: {
          orderBy: { dayNumber: 'asc' },
          include: { activities: { orderBy: { order: 'asc' } } },
        },
      },
    });

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found.' });
    }

    if (itinerary.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, data: itinerary });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── UPDATE ITINERARY ──────────────────────────────────────────
const updateItinerary = async (req, res) => {
  try {
    const { title, notes, status } = req.body;

    const itinerary = await prisma.itinerary.findUnique({ where: { id: req.params.id } });

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found.' });
    }

    if (itinerary.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const validStatuses = ['DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const data = {};
    if (title  !== undefined) data.title  = title;
    if (notes  !== undefined) data.notes  = notes;
    if (status !== undefined) data.status = status;

    const updated = await prisma.itinerary.update({
      where:   { id: req.params.id },
      data,
      include: {
        days: {
          orderBy: { dayNumber: 'asc' },
          include: { activities: { orderBy: { order: 'asc' } } },
        },
      },
    });

    res.status(200).json({ success: true, message: 'Itinerary updated.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── DELETE ITINERARY ──────────────────────────────────────────
const deleteItinerary = async (req, res) => {
  try {
    const itinerary = await prisma.itinerary.findUnique({ where: { id: req.params.id } });

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found.' });
    }

    if (itinerary.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await prisma.itinerary.delete({ where: { id: req.params.id } });

    res.status(200).json({ success: true, message: 'Itinerary deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { generate, getMyItineraries, getItineraryById, updateItinerary, deleteItinerary };
