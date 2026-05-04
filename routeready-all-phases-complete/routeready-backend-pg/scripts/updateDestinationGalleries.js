/**
 * Adds two supporting gallery images for every destination.
 *
 * Run from routeready-backend-pg/:
 *   node scripts/updateDestinationGalleries.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function cleanUrl(url) {
  return typeof url === 'string' ? url.trim() : '';
}

function sameValue(a, b) {
  return cleanUrl(a).toLowerCase() === cleanUrl(b).toLowerCase();
}

function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

function hasSameText(a, b) {
  return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
}

function byName(a, b) {
  return `${a.name || ''}${a.id || ''}`.localeCompare(`${b.name || ''}${b.id || ''}`);
}

function relatedImageCandidates(destination, destinations) {
  const others = destinations
    .filter(item => item.id !== destination.id && cleanUrl(item.image))
    .sort(byName);

  const groups = [
    others.filter(item => hasSameText(item.city, destination.city) && hasSameText(item.category, destination.category)),
    others.filter(item => hasSameText(item.city, destination.city)),
    others.filter(item => hasSameText(item.province, destination.province) && hasSameText(item.category, destination.category)),
    others.filter(item => hasSameText(item.category, destination.category)),
    others.filter(item => hasSameText(item.province, destination.province)),
    others,
  ];

  return groups.flatMap(group => group.map(item => item.image));
}

async function updateDestinationGalleries() {
  const destinations = await prisma.destination.findMany({
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

  let changed = 0;
  let unchanged = 0;
  let shortGallery = 0;

  for (const destination of destinations) {
    const mainImage = cleanUrl(destination.image);
    const gallery = [];

    const add = url => {
      const cleaned = cleanUrl(url);
      if (!cleaned) return false;
      if (mainImage && sameValue(cleaned, mainImage)) return false;
      if (gallery.some(existing => sameValue(existing, cleaned))) return false;
      gallery.push(cleaned);
      return gallery.length >= 2;
    };

    for (const existing of destination.gallery || []) {
      if (add(existing)) break;
    }

    if (gallery.length < 2) {
      for (const candidate of relatedImageCandidates(destination, destinations)) {
        if (add(candidate)) break;
      }
    }

    if (gallery.length < 2 && mainImage) {
      gallery.push(mainImage);
    }

    const nextGallery = gallery.slice(0, 2);
    if (nextGallery.length < 2) shortGallery++;

    if (arraysEqual(destination.gallery || [], nextGallery)) {
      unchanged++;
      continue;
    }

    await prisma.destination.update({
      where: { id: destination.id },
      data: { gallery: nextGallery },
    });

    changed++;
    console.log(`OK ${destination.name}: ${nextGallery.length} gallery images`);
  }

  console.log('\nGallery update complete');
  console.log(`Destinations checked: ${destinations.length}`);
  console.log(`Changed: ${changed}`);
  console.log(`Already OK: ${unchanged}`);
  console.log(`Still under 2 images: ${shortGallery}`);
}

updateDestinationGalleries()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
