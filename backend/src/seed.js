/**
 * Seed Script — Populates MongoDB with destinations and hotels
 * Run: node src/seed.js
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Destination = require("./models/Destination");
const Hotel = require("./models/Hotel");

const destinations = [
  // ── ISLAMABAD ──
  { name: "Faisal Mosque", city: "Islamabad", category: "Religious", rating: 4.9, price: 0, badge: "Iconic", description: "An iconic white marble mosque featuring contemporary Islamic architecture. Designed by Turkish architect Vedat Dalokay, it can accommodate up to 100,000 worshippers.", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80", openingHours: "5:00 AM – 11:00 PM", bestTime: "Sunset", duration: "1.5-2 hours", highlights: [{ icon: "🕌", title: "Architectural Marvel", subtitle: "Modern Bedouin-tent design" }, { icon: "📷", title: "Photo Spot", subtitle: "Stunning Margalla Hills backdrop" }, { icon: "🌅", title: "Sunset Views", subtitle: "Best visited in golden hour" }, { icon: "🎓", title: "Islamic University", subtitle: "Houses IIUI campus nearby" }], tips: ["Dress modestly — cover shoulders and knees. Women must cover their heads.", "Best time: early morning or just before sunset.", "Free parking available on-site. Allow 1.5–2 hours."] },
  { name: "Daman-e-Koh", city: "Islamabad", category: "Nature", rating: 4.7, price: 50, badge: "Viewpoint", description: "A hilltop garden offering panoramic views of the capital city and surrounding Margalla Hills.", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", bestTime: "Evening", duration: "1-2 hours" },
  { name: "Pakistan Monument", city: "Islamabad", category: "Landmark", rating: 4.8, price: 100, badge: "Heritage", description: "A bronze lotus petal monument symbolizing the country's diverse cultures and provinces.", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80", bestTime: "Morning", duration: "1-2 hours" },
  { name: "Margalla Hills", city: "Islamabad", category: "Nature", rating: 4.9, price: 0, badge: "Trails", description: "Green hills harboring popular hiking trails and dense forests at the foothills of the Himalayas.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", bestTime: "Morning", duration: "3-4 hours" },
  { name: "Lok Virsa Museum", city: "Islamabad", category: "Culture", rating: 4.6, price: 200, badge: "Museum", description: "A cultural museum preserving the rich heritage and traditions of Pakistan's diverse regions.", image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80", bestTime: "Afternoon", duration: "2-3 hours" },
  { name: "Centaurus Mall", city: "Islamabad", category: "Shopping", rating: 4.5, price: 0, badge: "Modern", description: "A modern, multi-story shopping mall with premium brands, food courts, and entertainment.", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80", bestTime: "Evening", duration: "2-3 hours" },

  // ── LAHORE ──
  { name: "Badshahi Mosque", city: "Lahore", category: "Religious", rating: 4.9, price: 50, badge: "Grand", description: "A massive, beautifully crafted Mughal-era mosque and one of the largest in the world.", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80", bestTime: "Morning", duration: "1-2 hours" },
  { name: "Lahore Fort", city: "Lahore", category: "Historic", rating: 4.8, price: 100, badge: "UNESCO", description: "A historical fort complex reflecting royal Mughal architecture spanning centuries of history.", image: "https://images.unsplash.com/photo-1599413987323-b2b8c0d7d9c8?w=800&q=80", bestTime: "Morning", duration: "2-3 hours" },
  { name: "Shalimar Gardens", city: "Lahore", category: "Nature", rating: 4.5, price: 50, badge: "Scenic", description: "Terraced Mughal gardens built as a royal paradise of water features and lush flora.", image: "https://images.unsplash.com/photo-1585325701165-f1f97d41bb6b?w=800&q=80", bestTime: "Morning", duration: "1-2 hours" },
  { name: "Walled City Lahore", city: "Lahore", category: "Culture", rating: 4.7, price: 0, badge: "Bazaars", description: "The bustling historic heart of the city full of lively bazaars and narrow streets.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", bestTime: "Evening", duration: "3-4 hours" },
  { name: "Wagah Border", city: "Lahore", category: "Landmark", rating: 4.8, price: 0, badge: "Patriotic", description: "Famous for the daily, energetic flag-lowering military ceremony at the Pakistan-India border.", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80", bestTime: "Evening", duration: "2-3 hours" },
  { name: "Food Street Lahore", city: "Lahore", category: "Food", rating: 4.9, price: 1500, badge: "Culinary", description: "A lively culinary hub serving authentic traditional Lahori delicacies and street food.", image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&q=80", bestTime: "Evening", duration: "2-3 hours" },

  // ── KARACHI ──
  { name: "Clifton Beach", city: "Karachi", category: "Beach", rating: 4.4, price: 0, badge: "Relax", description: "A popular city beach along the Arabian Sea coast, perfect for evening strolls.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", bestTime: "Evening", duration: "2-3 hours" },
  { name: "Quaid Mausoleum", city: "Karachi", category: "Historic", rating: 4.7, price: 50, badge: "Mazar", description: "The serene white marble resting place of Pakistan's founder, Quaid-e-Azam Muhammad Ali Jinnah.", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80", bestTime: "Morning", duration: "1-2 hours" },
  { name: "Mohatta Palace", city: "Karachi", category: "Culture", rating: 4.6, price: 150, badge: "Museum", description: "A grand, intricately designed palace serving as an art and heritage museum.", image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80", bestTime: "Afternoon", duration: "1-2 hours" },
  { name: "Port Grand", city: "Karachi", category: "Food", rating: 4.5, price: 500, badge: "Dining", description: "A scenic waterfront complex full of diverse food stands, restaurants, and entertainment.", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", bestTime: "Evening", duration: "2-3 hours" },
  { name: "Empress Market", city: "Karachi", category: "Shopping", rating: 4.3, price: 0, badge: "Bazaar", description: "A historic, colonial-era market bustling with fresh goods, spices, and local crafts.", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80", bestTime: "Morning", duration: "1-2 hours" },
  { name: "Manora Island", city: "Karachi", category: "Nature", rating: 4.2, price: 200, badge: "Island", description: "A small, peaceful island accessible by boat featuring a tall lighthouse and beaches.", image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80", bestTime: "Morning", duration: "Half day" },

  // ── HUNZA ──
  { name: "Rakaposhi View Point", city: "Hunza", category: "Nature", rating: 4.9, price: 0, badge: "Vista", description: "A breathtaking roadside stop with direct views of the 7,788m Rakaposhi peak.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", bestTime: "Morning", duration: "30 min", isHiddenGem: true },
  { name: "Attabad Lake", city: "Hunza", category: "Nature", rating: 5.0, price: 300, badge: "Lake", description: "A stunning turquoise blue lake perfect for boating, jetskiing, and photography.", image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80", bestTime: "Morning", duration: "2-3 hours" },
  { name: "Baltit Fort", city: "Hunza", category: "Historic", rating: 4.8, price: 500, badge: "Ancient", description: "An ancient fort perched high offering sweeping views of the valley below.", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", bestTime: "Morning", duration: "1-2 hours" },
  { name: "Eagle Nest", city: "Hunza", category: "Adventure", rating: 4.9, price: 200, badge: "High Point", description: "The highest viewpoint in Hunza, famous for majestic golden hour vistas.", image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80", bestTime: "Sunset", duration: "1-2 hours", isHiddenGem: true },
  { name: "Karimabad Bazaar", city: "Hunza", category: "Shopping", rating: 4.6, price: 0, badge: "Local", description: "A vibrant local market rich with handicrafts, precious gems, and dry fruits.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", bestTime: "Afternoon", duration: "1-2 hours" },
  { name: "Passu Cones", city: "Hunza", category: "Adventure", rating: 5.0, price: 0, badge: "Peaks", description: "Dramatic, jagged rock spires standing majestically along the Karakoram Highway.", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", bestTime: "Morning", duration: "1-2 hours", isHiddenGem: true },

  // ── SWAT ──
  { name: "Malam Jabba", city: "Swat", category: "Adventure", rating: 4.8, price: 1000, badge: "Ski", description: "A premier hill station and ski resort ideal for winter sports and mountain views.", image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80", bestTime: "Winter", duration: "Full day" },
  { name: "Mingora Bazaar", city: "Swat", category: "Shopping", rating: 4.2, price: 0, badge: "Market", description: "The main commercial hub of the valley, offering clothes, spices, and local crafts.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", bestTime: "Morning", duration: "1-2 hours" },
  { name: "Swat River", city: "Swat", category: "Nature", rating: 4.7, price: 0, badge: "Scenic", description: "A fast-flowing, crystal-clear river coursing through the picturesque green valley.", image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80", bestTime: "Morning", duration: "1-2 hours", isHiddenGem: true },
  { name: "Butkara Stupa", city: "Swat", category: "Historic", rating: 4.4, price: 200, badge: "Ruins", description: "Ancient Buddhist archaeological ruins unearthing Swat's profound and diverse history.", image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80", bestTime: "Morning", duration: "1-2 hours", isHiddenGem: true },
];

const hotels = [
  // ── ISLAMABAD ──
  { name: "Serena Hotel Islamabad", city: "Islamabad", area: "Diplomatic Enclave", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", stars: 5, rating: 9.3, reviewCount: 2150, price: 35000, originalPrice: 40000, badge: "Top Luxury", badgeClass: "luxury", amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym"] },
  { name: "Marriott Islamabad", city: "Islamabad", area: "Aga Khan Road", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", stars: 5, rating: 8.9, reviewCount: 1800, price: 30000, originalPrice: 35000, badge: "Popular", badgeClass: "", amenities: ["WiFi", "Pool", "Restaurant", "Gym", "Parking"] },
  { name: "PC Hotel Islamabad", city: "Islamabad", area: "Blue Area", image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80", stars: 4, rating: 8.5, reviewCount: 1200, price: 18000, originalPrice: 22000, badge: "Business", badgeClass: "", amenities: ["WiFi", "Restaurant", "Gym", "Parking"] },
  { name: "Envoy Continental", city: "Islamabad", area: "Blue Area", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", stars: 3, rating: 8.1, reviewCount: 850, price: 8000, originalPrice: 10000, badge: "Value", badgeClass: "", amenities: ["WiFi", "Restaurant", "Parking"] },
  { name: "Islamabad Backpackers Hostel", city: "Islamabad", area: "F-6", image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80", stars: 1, rating: 7.9, reviewCount: 400, price: 2500, originalPrice: 0, badge: "Budget", badgeClass: "", amenities: ["WiFi", "Common Room", "Lockers"] },

  // ── LAHORE ──
  { name: "Pearl Continental Lahore", city: "Lahore", area: "Mall Road", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", stars: 5, rating: 9.1, reviewCount: 2500, price: 32000, originalPrice: 38000, badge: "Top Luxury", badgeClass: "luxury", amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym"] },
  { name: "Avari Hotel Lahore", city: "Lahore", area: "Mall Road", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", stars: 4, rating: 8.8, reviewCount: 1900, price: 20000, originalPrice: 24000, badge: "Popular", badgeClass: "", amenities: ["WiFi", "Pool", "Restaurant", "Gym"] },
  { name: "Faletti's Hotel", city: "Lahore", area: "Egerton Road", image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80", stars: 4, rating: 8.6, reviewCount: 1560, price: 15000, originalPrice: 18000, badge: "Heritage", badgeClass: "", amenities: ["WiFi", "Restaurant", "Historic Building", "Parking"] },
  { name: "Hotel One Lahore", city: "Lahore", area: "Gulberg", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", stars: 3, rating: 8.2, reviewCount: 1100, price: 7000, originalPrice: 9000, badge: "Value", badgeClass: "", amenities: ["WiFi", "Restaurant", "Parking"] },
  { name: "Lahore Backpackers", city: "Lahore", area: "Mall Road", image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80", stars: 1, rating: 7.8, reviewCount: 650, price: 2000, originalPrice: 0, badge: "Budget", badgeClass: "", amenities: ["WiFi", "Common Room"] },

  // ── KARACHI ──
  { name: "PC Hotel Karachi", city: "Karachi", area: "Club Road", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", stars: 5, rating: 9.0, reviewCount: 3100, price: 38000, originalPrice: 45000, badge: "Top Luxury", badgeClass: "luxury", amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Beach View"] },
  { name: "Movenpick Karachi", city: "Karachi", area: "Club Road", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", stars: 5, rating: 8.9, reviewCount: 2600, price: 40000, originalPrice: 46000, badge: "Popular", badgeClass: "", amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym"] },
  { name: "Ramada Karachi", city: "Karachi", area: "Airport", image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80", stars: 4, rating: 8.4, reviewCount: 1800, price: 16000, originalPrice: 20000, badge: "Business", badgeClass: "", amenities: ["WiFi", "Pool", "Restaurant", "Gym"] },
  { name: "Hotel Mehran", city: "Karachi", area: "Shahrah-e-Faisal", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", stars: 3, rating: 8.0, reviewCount: 1300, price: 9000, originalPrice: 11000, badge: "Value", badgeClass: "", amenities: ["WiFi", "Restaurant", "Parking"] },
  { name: "Karachi Hostel", city: "Karachi", area: "Saddar", image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80", stars: 1, rating: 7.6, reviewCount: 500, price: 2200, originalPrice: 0, badge: "Budget", badgeClass: "", amenities: ["WiFi", "Common Room", "Lockers"] },

  // ── HUNZA ──
  { name: "Serena Hunza", city: "Hunza", area: "Karimabad", image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80", stars: 4, rating: 9.4, reviewCount: 1400, price: 22000, originalPrice: 25000, badge: "Scenic", badgeClass: "luxury", amenities: ["WiFi", "Restaurant", "Mountain View", "Garden"] },
  { name: "Eagle Nest Hotel", city: "Hunza", area: "Duikar", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", stars: 3, rating: 9.0, reviewCount: 1600, price: 12000, originalPrice: 15000, badge: "Views", badgeClass: "", amenities: ["WiFi", "Restaurant", "Panoramic View"] },
  { name: "Hunza Explorers Inn", city: "Hunza", area: "Aliabad", image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80", stars: 2, rating: 8.4, reviewCount: 850, price: 5000, originalPrice: 7000, badge: "Value", badgeClass: "", amenities: ["WiFi", "Basic Meals", "Mountain View"] },
  { name: "Old Hunza Inn", city: "Hunza", area: "Karimabad", image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80", stars: 1, rating: 8.2, reviewCount: 1200, price: 3000, originalPrice: 4000, badge: "Budget", badgeClass: "", amenities: ["WiFi", "Meals Included"] },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri || mongoUri === "your_mongodb_atlas_uri_here") {
      console.error("❌ Please set a valid MONGO_URI in your .env file first!");
      console.log("   Sign up at https://www.mongodb.com/cloud/atlas");
      process.exit(1);
    }

    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Destination.deleteMany({});
    await Hotel.deleteMany({});

    // Insert destinations
    console.log("🗺️  Seeding destinations...");
    const insertedDestinations = await Destination.insertMany(destinations);
    console.log(`   ✅ ${insertedDestinations.length} destinations inserted`);

    // Insert hotels
    console.log("🏨 Seeding hotels...");
    const insertedHotels = await Hotel.insertMany(hotels);
    console.log(`   ✅ ${insertedHotels.length} hotels inserted`);

    console.log("\n🎉 Database seeded successfully!");
    console.log(`   📍 ${insertedDestinations.length} destinations`);
    console.log(`   🏨 ${insertedHotels.length} hotels`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seedDatabase();
