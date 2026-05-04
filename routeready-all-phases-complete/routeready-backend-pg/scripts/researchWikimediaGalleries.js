/**
 * Researches two new Wikimedia Commons images for destination detail galleries.
 *
 * The script avoids every image URL/file already present in the destination table.
 * Run from routeready-backend-pg/:
 *   node scripts/researchWikimediaGalleries.js
 *
 * Batch options:
 *   node scripts/researchWikimediaGalleries.js --offset=0 --limit=30
 *   node scripts/researchWikimediaGalleries.js --skip-wikimedia-gallery --limit=20
 *   node scripts/researchWikimediaGalleries.js --dry-run
 */

require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API = 'https://api.wikimedia.org/core/v1/commons/search/page';
const USER_AGENT = 'RouteReadyImageResearch/1.0 (student project image curation)';
const REPORT_PATH = path.join(__dirname, 'galleryResearchReport.json');

function commonsThumb(file) {
  const title = file.replace(/ /g, '_');
  const hash = crypto.createHash('md5').update(title).digest('hex');
  const encoded = encodeURIComponent(title);
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${hash[0]}/${hash.slice(0, 2)}/${encoded}/1000px-${encoded}`;
}

const aliases = {
  'Quaid-e-Azam Mausoleum': ['Mazar-e-Quaid', 'Jinnah Mausoleum Karachi'],
  'Shah Jahan Mosque Thatta': ['Shah Jahan Mosque Thatta', 'Shahjahan Mosque Thatta'],
  'Saif-ul-Malook Lake': ['Lake Saiful Muluk', 'Saif ul Malook Lake'],
  'Deosai Sheosar Lake': ['Sheosar Lake', 'Deosai Plains Sheosar'],
  'Margalla Hills National Park': ['Margalla Hills', 'Margalla National Park'],
  'Lahore Fort Road Food Street': ['Fort Road Food Street Lahore', 'Food Street Lahore Fort'],
  'Gawalmandi Food Street': ['Gawalmandi Lahore', 'Gawalmandi Food Street Lahore'],
  'Walled City of Lahore': ['Walled City Lahore', 'Delhi Gate Lahore'],
  'Shah Rukn-e-Alam Shrine': ['Tomb of Shah Rukn-e-Alam', 'Shah Rukn Alam Multan'],
  'Shah Jahan Mosque Thatta': ['Shah Jahan Mosque Thatta', 'Jamia Masjid Thatta'],
  'Taxila Archaeological Site': ['Taxila', 'Taxila ruins'],
  'Mohenjo-Daro': ['Mohenjo-daro', 'Mohenjo Daro'],
  'Takht-i-Bahi': ['Takht-i-Bahi', 'Takht Bhai'],
  'Katas Raj Temples': ['Katas Raj', 'Katas Raj Temples'],
  'Khewra Salt Mines': ['Khewra Salt Mine', 'Khewra Mines'],
  'Khyber Pass': ['Khyber Pass', 'Khyber Pakhtunkhwa pass'],
  'Swat River Rafting': ['Swat River', 'Swat River Pakistan'],
  'Babusar Pass': ['Babusar Top', 'Babusar Pass'],
  'Nathiagali': ['Nathia Gali', 'Nathiagali'],
  'Daman-e-Koh': ['Daman-e-Koh', 'Daman e Koh Islamabad'],
  'Do Darya Food Street': ['Do Darya Karachi', 'Do Darya'],
  'Badshahi Hammam': ['Shahi Hammam Lahore', 'Wazir Khan Hammam'],
  'Astola Island': ['Astola Island', 'Astola Island Pakistan'],
  'Mahabat Khan Mosque': ['Mahabat Khan Mosque', 'Mohabbat Khan Mosque'],
  'Makli Necropolis': ['Makli Necropolis', 'Makli Thatta'],
  'Qissa Khwani Bazaar': ['Qissa Khwani Bazaar', 'Qissa Khwani Peshawar'],
  'Princess of Hope': ['Princess of Hope Hingol', 'Princess of Hope Pakistan'],
  'Sheikhupura Fort and Hiran Minar': ['Hiran Minar', 'Sheikhupura Fort'],
  'Chaukhandi Tombs': ['Chaukhandi Tombs', 'Chaukhandi Karachi'],
  'Pakistan Maritime Museum': ['Pakistan Maritime Museum', 'Maritime Museum Karachi'],
  'Lok Virsa Museum': ['Lok Virsa Museum', 'Heritage Museum Islamabad'],
  'Mall Road Murree': ['Mall Road Murree', 'Murree Mall Road'],
  'Faisal Mosque': ['Faisal Mosque', 'Shah Faisal Mosque'],
  'Gwadar': ['Gwadar beach', 'Gwadar city', 'Gwadar port city'],
};

const curatedSelections = {
  Dungagali: [
    {
      title: 'File:Twilight Winters, Dunga Gali, Pakistan.jpg',
      url: commonsThumb('Twilight Winters, Dunga Gali, Pakistan.jpg'),
    },
    {
      title: 'File:Pipe Line Track, Dunga Gali, KPK, Pakistan.jpg',
      url: commonsThumb('Pipe Line Track, Dunga Gali, KPK, Pakistan.jpg'),
    },
  ],
  'Gawalmandi Food Street': [
    {
      title: 'File:Food Street , Lahore.jpg',
      url: commonsThumb('Food Street , Lahore.jpg'),
    },
    {
      title: 'File:Old lahore food street view.jpg',
      url: commonsThumb('Old lahore food street view.jpg'),
    },
  ],
  Gwadar: [
    {
      title: 'File:GWADAR BEACH.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/GWADAR_BEACH.jpg/1000px-GWADAR_BEACH.jpg',
    },
    {
      title: 'File:Sunset from Gwadar Beach.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Sunset_from_Gwadar_Beach.jpg/1000px-Sunset_from_Gwadar_Beach.jpg',
    },
  ],
  'Liberty Market': [
    {
      title: 'File:Dome of the Liberty Market, 2023-08-24.jpg',
      url: commonsThumb('Dome of the Liberty Market, 2023-08-24.jpg'),
    },
    {
      title: 'Liberty Market, Lahore - Hear It From Locals',
      url: 'https://i2.wp.com/hearitfromlocals.com/wp-content/uploads/2019/02/liberty_market.jpg?quality=80&resize=1000%2C666&ssl=1&strip=all',
    },
  ],
  'Shandur Pass': [
    {
      title: 'File:Landscape on way to Shandur Pass from Phandar Valley.jpg',
      url: commonsThumb('Landscape on way to Shandur Pass from Phandar Valley.jpg'),
    },
    {
      title: 'File:Shandur Top & Shandur Lake.jpg',
      url: commonsThumb('Shandur Top & Shandur Lake.jpg'),
    },
  ],
  'Swat River Rafting': [
    {
      title: 'File:River Swat KPK.jpg',
      url: commonsThumb('River Swat KPK.jpg'),
    },
    {
      title: 'File:Swat river Pakistan.jpg',
      url: commonsThumb('Swat river Pakistan.jpg'),
    },
  ],
  'Swat Valley': [
    {
      title: 'File:Swat Valley in Pakistan.jpg',
      url: commonsThumb('Swat Valley in Pakistan.jpg'),
    },
    {
      title: 'File:A snowy peak to the East of Kalam, Swat Valley.jpg',
      url: commonsThumb('A snowy peak to the East of Kalam, Swat Valley.jpg'),
    },
  ],
  'Thar Desert': [
    {
      title: 'File:Landscape of Thar Desert.jpg',
      url: commonsThumb('Landscape of Thar Desert.jpg'),
    },
    {
      title: 'File:Thar desert in cloudy weather.jpg',
      url: commonsThumb('Thar desert in cloudy weather.jpg'),
    },
  ],
};

const blockedWords = [
  'map', 'locator', 'location', 'flag', 'logo', 'seal', 'symbol', 'coat_of_arms',
  'diagram', 'chart', 'plan', 'pdf', 'svg', 'webm', 'ogv', 'audio', 'video',
  'timeline', 'hydrographical', 'engrav', 'bays', 'coast of persia',
  'tiff', 'satellite', 'umbra', 'corundum', 'rubin', 'mineral',
  'airport', 'underconstruction', 'orthographic', 'ormara', 'wyvern', 'kech-cum',
];

function argText(name, fallback = '') {
  const found = process.argv.find(arg => arg.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : fallback;
}

function argValue(name, fallback) {
  const found = process.argv.find(arg => arg.startsWith(`--${name}=`));
  return found ? Number(found.split('=')[1]) : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function compact(value) {
  return String(value || '').trim();
}

function normalizeText(value) {
  return compact(value).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
}

function normalizeUrl(value) {
  return compact(value).split('?')[0].toLowerCase();
}

function fileIdentityFromTitle(title) {
  return normalizeText(String(title || '').replace(/^File:/i, ''));
}

function fileIdentityFromUrl(url) {
  const clean = compact(url).split('?')[0];
  const uploadMatch = clean.match(/\/wikipedia\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/]+)/i);
  if (!uploadMatch) return normalizeUrl(clean);
  try {
    return normalizeText(decodeURIComponent(uploadMatch[1]));
  } catch {
    return normalizeText(uploadMatch[1]);
  }
}

function thumbnailUrl(page) {
  const thumb = page.thumbnail;
  if (!thumb || !thumb.url || !String(thumb.mimetype || '').startsWith('image/')) return '';
  if (!String(page.key || '').startsWith('File:')) return '';
  if (/\.(tif|tiff|svg|pdf|webm|ogv)$/i.test(page.key || '')) return '';
  const clean = thumb.url.split('?')[0];
  if (!/\/thumb\//.test(clean)) return clean;
  return clean.replace(/\/\d+px-([^/]+)$/i, '/1000px-$1');
}

function exactNames(destination) {
  return [...new Set([destination.name, ...(aliases[destination.name] || [])].filter(Boolean))];
}

function searchQueries(destination) {
  const names = exactNames(destination);
  const queries = [];
  for (const name of names) {
    queries.push(`${name} ${destination.city} Pakistan`);
    queries.push(`${name} Pakistan`);
    queries.push(name);
  }
  return [...new Set(queries.map(query => query.replace(/\s+/g, ' ').trim()))];
}

function hasWikimediaThumbGallery(destination) {
  const gallery = destination.gallery || [];
  return gallery.length >= 2 && gallery
    .slice(0, 2)
    .every(url => normalizeUrl(url).includes('upload.wikimedia.org/wikipedia/commons/thumb/'));
}

function wordsFor(destination) {
  const generic = new Set([
    'national', 'park', 'lake', 'valley', 'fort', 'mosque', 'museum', 'pass',
    'base', 'camp', 'road', 'food', 'street', 'city', 'resort', 'beach',
    'hills', 'hill', 'shrine', 'temples', 'tombs', 'bazaar',
  ]);

  return exactNames(destination)
    .join(' ')
    .split(/[^a-z0-9]+/i)
    .map(word => word.toLowerCase())
    .filter(word => word.length > 2 && !generic.has(word));
}

function candidateScore(page, destination) {
  const title = normalizeText(page.title || page.key);
  const excerpt = normalizeText(page.excerpt || '');
  const text = `${title} ${excerpt}`;
  const titleKey = normalizeText(page.key || '');
  const words = wordsFor(destination);
  let score = 0;

  for (const name of exactNames(destination)) {
    if (text.includes(normalizeText(name))) score += 12;
  }

  for (const word of words) {
    if (title.includes(word)) score += 5;
    else if (text.includes(word)) score += 2;
  }

  if (destination.city && text.includes(normalizeText(destination.city))) score += 3;
  if (destination.province && text.includes(normalizeText(destination.province))) score += 2;
  if (text.includes('pakistan')) score += 2;
  if (titleKey.startsWith('file:')) score += 2;

  if (blockedWords.some(word => title.includes(word))) score -= 20;
  return score;
}

function goodEnough(page, destination) {
  const score = candidateScore(page, destination);
  const words = wordsFor(destination);
  const minimum = words.length ? Math.min(10, 4 + words.length * 2) : 8;
  const title = normalizeText(page.title || page.key);
  const titleHasPlaceName = exactNames(destination).some(name => title.includes(normalizeText(name)));
  const titleHasDistinctWord = words.some(word => title.includes(word));
  return score >= minimum && (titleHasPlaceName || titleHasDistinctWord);
}

async function searchCommons(query, attempt = 1) {
  const url = `${API}?q=${encodeURIComponent(query)}&limit=15`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });

  if (response.status === 429 && attempt <= 4) {
    const retryAfter = Number(response.headers.get('retry-after')) || attempt * 6;
    await sleep(retryAfter * 1000);
    return searchCommons(query, attempt + 1);
  }

  if (!response.ok) {
    throw new Error(`Wikimedia API ${response.status} for "${query}"`);
  }

  const data = await response.json();
  return Array.isArray(data.pages) ? data.pages : [];
}

async function findImages(destination, alreadyUsed, options) {
  const selected = [];
  const seenTitles = new Set();
  const queries = searchQueries(destination).slice(0, options.maxQueries);

  for (const item of curatedSelections[destination.name] || []) {
    const titleIdentity = fileIdentityFromTitle(item.title);
    const urlIdentity = fileIdentityFromUrl(item.url);
    if (alreadyUsed.has(titleIdentity) || alreadyUsed.has(urlIdentity) || alreadyUsed.has(normalizeUrl(item.url))) {
      continue;
    }
    selected.push({
      url: item.url,
      title: item.title,
      query: 'curated Wikimedia API result',
      score: 100,
    });
    alreadyUsed.add(titleIdentity);
    alreadyUsed.add(urlIdentity);
    alreadyUsed.add(normalizeUrl(item.url));
    if (selected.length >= 2) return selected;
  }

  for (const query of queries) {
    const pages = await searchCommons(query);
    const ranked = pages
      .filter(page => String(page.key || '').startsWith('File:'))
      .filter(page => !seenTitles.has(fileIdentityFromTitle(page.key)))
      .map(page => ({ page, score: candidateScore(page, destination), url: thumbnailUrl(page) }))
      .filter(item => item.url && goodEnough(item.page, destination))
      .sort((a, b) => b.score - a.score);

    for (const item of ranked) {
      const titleIdentity = fileIdentityFromTitle(item.page.key);
      const urlIdentity = fileIdentityFromUrl(item.url);
      seenTitles.add(titleIdentity);

      if (alreadyUsed.has(titleIdentity) || alreadyUsed.has(urlIdentity) || alreadyUsed.has(normalizeUrl(item.url))) {
        continue;
      }

      selected.push({
        url: item.url,
        title: item.page.title || item.page.key,
        query,
        score: item.score,
      });
      alreadyUsed.add(titleIdentity);
      alreadyUsed.add(urlIdentity);
      alreadyUsed.add(normalizeUrl(item.url));

      if (selected.length >= 2) return selected;
    }

    await sleep(options.queryDelay);
  }

  return selected;
}

async function main() {
  const dryRun = hasFlag('dry-run');
  const skipWikimediaGallery = hasFlag('skip-wikimedia-gallery');
  const offset = argValue('offset', 0);
  const limit = argValue('limit', null);
  const maxQueries = argValue('max-queries', 4);
  const queryDelay = argValue('query-delay', 1200);
  const namesFilter = argText('names')
    .split(',')
    .map(name => normalizeText(name))
    .filter(Boolean);

  const allDestinations = await prisma.destination.findMany({
    select: {
      id: true,
      name: true,
      city: true,
      province: true,
      category: true,
      image: true,
      gallery: true,
    },
    orderBy: { name: 'asc' },
  });

  const destinations = allDestinations
    .slice(offset, limit ? offset + limit : undefined)
    .filter(destination => !namesFilter.length || namesFilter.includes(normalizeText(destination.name)))
    .filter(destination => !(skipWikimediaGallery && hasWikimediaThumbGallery(destination)));
  const alreadyUsed = new Set();
  for (const destination of allDestinations) {
    for (const url of [destination.image, ...(destination.gallery || [])]) {
      if (!url) continue;
      alreadyUsed.add(normalizeUrl(url));
      alreadyUsed.add(fileIdentityFromUrl(url));
    }
  }

  const report = {
    dryRun,
    skipWikimediaGallery,
    offset,
    limit,
    maxQueries,
    queryDelay,
    names: namesFilter,
    totalInDatabase: allDestinations.length,
    processed: destinations.length,
    updated: [],
    unresolved: [],
  };

  console.log(`Researching ${destinations.length} destinations from Wikimedia Commons...\n`);

  for (const destination of destinations) {
    try {
      const images = await findImages(destination, alreadyUsed, { maxQueries, queryDelay });
      if (images.length < 2) {
        report.unresolved.push({
          name: destination.name,
          city: destination.city,
          province: destination.province,
          found: images,
        });
        console.log(`NEEDS REVIEW ${destination.name}: found ${images.length}/2`);
        fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
        continue;
      }

      if (!dryRun) {
        await prisma.destination.update({
          where: { id: destination.id },
          data: { gallery: images.map(image => image.url) },
        });
      }

      report.updated.push({
        name: destination.name,
        images,
      });
      console.log(`OK ${destination.name}`);
      images.forEach((image, index) => console.log(`  ${index + 1}. ${image.title}`));
      fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    } catch (error) {
      report.unresolved.push({
        name: destination.name,
        city: destination.city,
        province: destination.province,
        error: error.message,
      });
      console.log(`ERROR ${destination.name}: ${error.message}`);
      fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    }
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log('\nWikimedia gallery research complete');
  console.log(`Updated: ${report.updated.length}`);
  console.log(`Needs manual review: ${report.unresolved.length}`);
  console.log(`Report: ${REPORT_PATH}`);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
