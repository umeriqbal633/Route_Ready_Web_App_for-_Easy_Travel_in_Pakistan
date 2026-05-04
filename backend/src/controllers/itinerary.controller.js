const Destination = require('../models/Destination');
const asyncHandler = require('../utils/asyncHandler');

const INTEREST_TO_CATS = {
  'heritage':    ['Historic', 'Landmark', 'Culture'],
  'nature':      ['Nature'],
  'food':        ['Food'],
  'shopping':    ['Shopping'],
  'religious':   ['Religious'],
  'photography': ['Nature', 'Landmark', 'Culture'],
  'art':         ['Culture'],
  'culture':     ['Culture'],
  'adventure':   ['Adventure'],
};

const SLOT_PREF = {
  morning:   ['Religious', 'Historic', 'Adventure', 'Nature', 'Landmark'],
  afternoon: ['Culture', 'Shopping', 'Landmark', 'Food', 'Nature'],
  evening:   ['Food', 'Shopping', 'Culture', 'Nature'],
};

function mapInterests(interests) {
  const cats = new Set();
  interests.forEach(raw => {
    const key = raw.toLowerCase().replace(/[^a-z\s]/g, '');
    Object.entries(INTEREST_TO_CATS).forEach(([k, v]) => {
      if (key.includes(k)) v.forEach(c => cats.add(c));
    });
  });
  return [...cats];
}

function preferredSlot(category) {
  for (const [slot, cats] of Object.entries(SLOT_PREF)) {
    if (cats.includes(category)) return slot;
  }
  return 'morning';
}

function dayTitle(activities) {
  const cats = [...new Set(activities.map(a => a.category))];
  return cats.slice(0, 2).join(' & ');
}

function addDays(base, offset) {
  if (!base) return undefined;
  const d = new Date(base);
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

const generateItinerary = asyncHandler(async (req, res) => {
  const {
    city, numDays = 2, travelerCount = 1,
    budgetRange = 'medium', startDate,
    interests = [], savedPlaces = []
  } = req.body;

  if (!city) {
    return res.status(400).json({ success: false, message: 'city is required' });
  }

  // 1. Fetch destinations for requested city (case-insensitive)
  const cityDests = await Destination
    .find({ city: new RegExp(`^${city.trim()}$`, 'i') })
    .sort({ rating: -1 });

  // 2. Fetch any specifically saved destinations by name
  let savedDests = [];
  if (savedPlaces && savedPlaces.length > 0) {
    savedDests = await Destination.find({ name: { $in: savedPlaces } });
  }

  // 3. Filter city dests by interests
  const wantedCats = mapInterests(interests);
  let pool = wantedCats.length
    ? cityDests.filter(d => wantedCats.includes(d.category))
    : [...cityDests];

  // Fallback: if interest filter gives too few, use all city dests
  if (pool.length < numDays * 2) pool = [...cityDests];

  // 4. Merge saved places first (no duplicates)
  const savedIds = new Set(savedDests.map(d => d._id.toString()));
  const merged = [
    ...savedDests,
    ...pool.filter(d => !savedIds.has(d._id.toString()))
  ];

  if (merged.length === 0) {
    return res.status(404).json({
      success: false,
      message: `No destinations found for "${city}". Please make sure the database is seeded.`
    });
  }

  // 5. Build day-by-day itinerary using slot-preference assignment
  const remaining = [...merged];
  const days = [];

  for (let dayNum = 1; dayNum <= numDays; dayNum++) {
    const activities = [];

    for (const slot of ['morning', 'afternoon', 'evening']) {
      if (remaining.length === 0) break;

      // Find the best-match destination for this slot
      let bestIdx = remaining.findIndex(d => preferredSlot(d.category) === slot);
      if (bestIdx === -1) bestIdx = 0;

      const dest = remaining.splice(bestIdx, 1)[0];
      activities.push({
        slot,
        name:          dest.name,
        description:   dest.description,
        duration:      dest.duration   || '1-2h',
        estimatedCost: dest.price === 0 ? 'Free' : `PKR ${dest.price}`,
        category:      dest.category,
        bestTime:      dest.bestTime,
        image:         dest.image,
      });
    }

    days.push({
      dayNumber: dayNum,
      date:      addDays(startDate, dayNum - 1),
      title:     `Day ${dayNum}: ${dayTitle(activities)}`,
      activities,
    });
  }

  // 6. Collect practical tips from destination records
  const tips = [];
  [...savedDests, ...cityDests].forEach(d => {
    if (d.tips && d.tips[0]) tips.push(d.tips[0]);
  });

  let result = {
    id:      null,
    title:   `Your ${numDays}-Day ${city} Adventure`,
    summary: `A personalized ${numDays}-day itinerary for ${city}${
      interests.length
        ? ', focused on ' + interests.slice(0, 3).map(i => i.replace(/[^\w\s]/g, '').trim()).join(', ')
        : ''
    }.`,
    city,
    numDays,
    days,
    tips: [...new Set(tips)].slice(0, 5),
  };

  // 7. Optionally enhance title/summary/tips with Gemini AI
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      result = await enhanceWithGemini(result, interests, city, geminiKey);
    } catch (e) {
      console.warn('Gemini enhancement skipped (using algorithmic plan):', e.message);
    }
  }

  res.json({ success: true, data: result });
});

async function enhanceWithGemini(tripData, interests, city, apiKey) {
  const places = tripData.days.flatMap(d => d.activities.map(a => a.name));
  const prompt = `You are a Pakistan travel expert. A traveler is visiting ${city} for ${tripData.numDays} days, covering: ${places.join(', ')}. Their interests: ${interests.join(', ')}.

Provide the following in valid JSON only (no markdown, no backticks):
{
  "title": "catchy trip title under 55 characters",
  "summary": "2-sentence engaging personalized summary mentioning the city and key highlights",
  "tips": ["specific local tip 1", "specific local tip 2", "specific local tip 3", "specific local tip 4", "specific local tip 5"]
}`;

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 600 },
      }),
      signal: AbortSignal.timeout(12000),
    }
  );

  if (!resp.ok) throw new Error(`Gemini HTTP ${resp.status}`);

  const data = await resp.json();
  const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const clean = raw.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(clean);

  return {
    ...tripData,
    title:   parsed.title   || tripData.title,
    summary: parsed.summary || tripData.summary,
    tips:    Array.isArray(parsed.tips) && parsed.tips.length ? parsed.tips : tripData.tips,
  };
}

module.exports = { generateItinerary };
