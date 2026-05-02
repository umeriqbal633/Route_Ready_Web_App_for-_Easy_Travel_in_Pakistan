/**
 * RouteReady — AI Itinerary Service (Phase 5)
 * Uses Google Gemini API (FREE tier) to generate Pakistan travel itineraries
 *
 * Get your FREE API key at: https://aistudio.google.com/app/apikey
 * Add to .env: GEMINI_API_KEY=your_key_here
 *
 * Free tier: 15 requests/minute, 1 million tokens/day
 */

const https = require("https");

const callGemini = (prompt) => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return reject(
        new Error(
          "GEMINI_API_KEY is not set in .env. Get a free key at https://aistudio.google.com/app/apikey",
        ),
      );
    }

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4000 },
    });

    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error)
            return reject(
              new Error(parsed.error.message || "Gemini API error"),
            );
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) return reject(new Error("No response from Gemini"));
          resolve(text);
        } catch (e) {
          reject(new Error("Failed to parse Gemini response"));
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.write(body);
    req.end();
  });
};

const generateItinerary = async ({
  city,
  numDays,
  startDate,
  travelerCount,
  interests,
  budgetRange,
  isStudent,
  travelStyle,
  notes,
}) => {
  const startTime = Date.now();

  const budgetLabel =
    {
      low: "Budget (PKR 500-2,000/day)",
      medium: "Mid-range (PKR 2,000-8,000/day)",
      high: "High-end (PKR 8,000-25,000/day)",
      luxury: "Luxury (PKR 25,000+/day)",
    }[budgetRange] || "Mid-range";

  const prompt = `You are RouteReady's AI travel planner specializing in Pakistan tourism. Generate a detailed, realistic travel itinerary.

TRIP DETAILS:
- Destination: ${city}, Pakistan
- Duration: ${numDays} day${numDays > 1 ? "s" : ""}
- Start Date: ${startDate}
- Travelers: ${travelerCount} person${travelerCount > 1 ? "s" : ""}
- Budget: ${budgetLabel}
- Travel Style: ${travelStyle || "solo"}
- Student Traveler: ${isStudent ? "Yes - prioritize free and cheap options, student discounts" : "No"}
- Interests: ${interests && interests.length > 0 ? interests.join(", ") : "General sightseeing"}
${notes ? `- Special Requests: ${notes}` : ""}

INSTRUCTIONS:
1. Create a realistic day-by-day itinerary for ${city}
2. Include morning, afternoon, and evening activities each day
3. Use REAL places, restaurants, and attractions in ${city} Pakistan
4. Include realistic PKR costs for each activity
5. Add local insider tips for each activity
6. Consider travel time between locations
7. Include meal recommendations with local cuisine

Respond ONLY with valid JSON. No markdown, no explanation, just raw JSON:
{
  "title": "Trip title",
  "city": "${city}",
  "numDays": ${numDays},
  "estimatedTotalCost": 0,
  "summary": "2-3 sentence trip summary",
  "days": [
    {
      "dayNumber": 1,
      "title": "Day theme title",
      "estimatedCost": 0,
      "activities": [
        {
          "slot": "morning",
          "name": "Activity name",
          "description": "What to do and why it is great",
          "location": "Exact location or address",
          "duration": "2 hours",
          "cost": 0,
          "category": "Sightseeing",
          "order": 1,
          "tip": "Local insider tip"
        }
      ]
    }
  ],
  "tips": ["General tip 1", "General tip 2", "General tip 3"],
  "bestTimeToVisit": "Season or month recommendation",
  "localPhrases": [
    {"phrase": "Shukriya", "meaning": "Thank you in Urdu"}
  ]
}`;

  const rawText = await callGemini(prompt);
  const generationTimeMs = Date.now() - startTime;

  let itineraryData;
  try {
    const cleaned = rawText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    itineraryData = JSON.parse(cleaned);
  } catch {
    throw new Error("AI returned invalid JSON. Please try again.");
  }

  return { itineraryData, generationTimeMs };
};

module.exports = { generateItinerary };
