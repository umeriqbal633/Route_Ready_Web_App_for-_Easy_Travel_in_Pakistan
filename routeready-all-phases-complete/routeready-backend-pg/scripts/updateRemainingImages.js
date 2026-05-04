/**
 * Updates destination images that were not covered by scripts/updateImages.js.
 * Run from routeready-backend-pg/: node scripts/updateRemainingImages.js
 */

require('dotenv').config();
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function commonsThumb(file) {
  const title = file.replace(/ /g, '_');
  const hash = crypto.createHash('md5').update(title).digest('hex');
  const encoded = encodeURIComponent(title);
  return `https://upload.wikimedia.org/wikipedia/commons/${hash[0]}/${hash.slice(0, 2)}/${encoded}`;
}

const updates = [
  { name: 'Anarkali Bazaar', image: commonsThumb('Inside view of anarkali bazar.jpg') },
  { name: 'Attock Fort', image: commonsThumb('Attock Fort - Optographer.jpg') },
  { name: 'Ayubia National Park', image: commonsThumb('Ayubia, Pakistan.jpg') },
  { name: 'Badshahi Hammam', image: commonsThumb('The Shahi Hammam.jpg') },
  { name: 'Bhurban', image: commonsThumb('Clouds in Pakistan near Bhurban by Aizad Sayid.jpg') },
  { name: 'Bolan Pass', image: commonsThumb('Mad max fury Balochistan.jpg') },
  { name: 'Chaukhandi Tombs', image: commonsThumb('Chaukhandi tombs.png') },
  { name: 'Cholistan Desert', image: commonsThumb('Cholistan Desert in Summer.jpg') },
  { name: 'Clifton Beach', image: commonsThumb('Clifton Beach Karachi.jpg') },
  { name: 'Do Darya Food Street', image: commonsThumb('Do Darya karachi.jpg') },
  { name: 'Dungagali', image: commonsThumb('Dunga Gali.jpg') },
  { name: 'Empress Market', image: commonsThumb('Empress Market, Karachi.jpg') },
  { name: 'Fatima Jinnah Park', image: commonsThumb('Fatima Jinnah Park Islamabad (2),Pakistan.JPG') },
  { name: 'Frere Hall', image: commonsThumb('Frere Hall Karachi Pakistan 01.jpg') },
  { name: 'Gilgit City', image: commonsThumb('Gilgit City (26103542816).jpg') },
  { name: 'Gorakh Hill Station', image: commonsThumb('Gorakh Hill Station Wide.jpg') },
  { name: 'Gwadar', image: commonsThumb('Gwadar Port.jpg') },
  { name: 'Hanna Lake', image: commonsThumb('Hanna Lake Quetta.jpg') },
  { name: 'Hawks Bay Beach', image: commonsThumb('HawksBay Beach.jpg') },
  { name: 'Katas Raj Temples', image: commonsThumb('Katas Raj temples.jpg') },
  { name: 'Khewra Salt Mines', image: commonsThumb('Khewra Salt Mines4.jpg') },
  { name: 'Khyber Pass', image: commonsThumb('Fort Jamrud, at the foot of the Khyber Pass, c1920s.jpg') },
  { name: 'Lahore Museum', image: commonsThumb('Lahore Museum Front View.jpg') },
  { name: 'Liberty Market', image: commonsThumb('Street view anarkali lahore.jpg') },
  { name: 'Lok Virsa Museum', image: commonsThumb('Islamabad Lok Virsa Museum exterior 07.jpg') },
  { name: 'Mahabat Khan Mosque', image: commonsThumb('Interior of Mahabat Khan Mosque.jpg') },
  { name: 'Makli Necropolis', image: commonsThumb('Makli Necropolis (1).jpg') },
  { name: 'Malam Jabba Ski Resort', image: commonsThumb('Malam Jabba Ski Resort, Malam Jabba KPK.jpg') },
  { name: 'Mall Road Murree', image: commonsThumb('Mall Road View Murree.jpg') },
  { name: 'Manchar Lake', image: commonsThumb('Mohanas of Manchar Lake.jpg') },
  { name: 'Minar-e-Pakistan', image: commonsThumb('The Minar-e-Pakistan.jpg') },
  { name: 'Mohatta Palace Museum', image: commonsThumb('Mohatta Palace.jpg') },
  { name: 'Nathiagali', image: commonsThumb('Nathia Gali 5.jpg') },
  { name: 'Pakistan Maritime Museum', image: commonsThumb('Pakistan Maritime Museum, Karachi, Pakistan 1.jpg') },
  { name: 'Pharwala Fort', image: commonsThumb('Pharwala Fort.JPG') },
  { name: 'Pir Chinasi', image: commonsThumb('Pir Chinasi - Marfhere3.jpg') },
  { name: 'Pir Sohawa', image: commonsThumb('Pir Sohawa, Islamabad.jpg') },
  { name: 'Princess of Hope', image: commonsThumb('Princess Of Hope.jpg') },
  { name: 'Qissa Khwani Bazaar', image: commonsThumb('Old Qissa Khwani.jpg') },
  { name: 'Quetta City', image: commonsThumb('Quetta at night.jpg') },
  { name: 'Rawal Lake', image: commonsThumb('Rawal lake islamabad.JPG') },
  { name: 'Rawalakot', image: commonsThumb('Rawalakot Valley.JPG') },
  { name: 'Saidpur Village', image: commonsThumb('Saidpur Village, Islamabad Capital Territory, P1090833 tonemapped.jpg') },
  { name: 'Shalimar Gardens', image: commonsThumb('Shalimar Gardens, Lahore.jpg') },
  { name: 'Sheikhupura Fort and Hiran Minar', image: commonsThumb('Hiran Minar minaret.jpg') },
  { name: 'Simli Dam', image: commonsThumb('Simli Dam.jpg') },
  { name: 'Soon Valley', image: commonsThumb('Soon Valley, Pakistan - 2.jpg') },
  { name: 'Swat River Rafting', image: commonsThumb('A view of swat river.jpg') },
  { name: 'Thar Desert', image: commonsThumb('The Thar Desert.jpg') },
  { name: 'Tomb of Jahangir', image: commonsThumb('Tomb of Emperor Jahangir.jpg') },
  { name: 'Ziarat Valley', image: commonsThumb('Ziarat Valley.jpg') },
];

async function updateRemainingImages() {
  console.log('Updating remaining destination images...\n');
  let matchedNames = 0;
  let updatedRows = 0;
  let notFound = 0;

  for (const item of updates) {
    const result = await prisma.destination.updateMany({
      where: { name: { equals: item.name, mode: 'insensitive' } },
      data: { image: item.image, gallery: [item.image] },
    });

    if (result.count > 0) {
      console.log(`  OK ${item.name} (${result.count})`);
      matchedNames++;
      updatedRows += result.count;
    } else {
      console.log(`  NOT FOUND ${item.name}`);
      notFound++;
    }
  }

  console.log(`\nDone. Matched names: ${matchedNames}, rows updated: ${updatedRows}, not found: ${notFound}`);
  await prisma.$disconnect();
}

updateRemainingImages().catch((error) => {
  console.error(error);
  prisma.$disconnect();
  process.exit(1);
});
