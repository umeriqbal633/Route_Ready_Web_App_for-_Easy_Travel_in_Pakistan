/**
 * Hidden Gems Image Update Script — Updates hidden gem images without wiping data
 * Run from routeready-backend-pg/: node scripts/updateHiddenGemsImages.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  { name: 'Deosai Brown Bear Tracking', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlKBwY7tMiUV88-m5avSWCofS61BxlCe27Gw&s' },
  { name: 'Fairy Meadows Stargazing', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcInaX7O8u16cnT92WsnPqau0XQacQAUj8Lw&s' },
  { name: 'Ratti Gali at First Snowfall', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgoJb1e9b0xuODswDC2S14KyC441ECO2tqtQ&s' },
  { name: 'Leepa Valley Apple Harvest', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSd1Bro2CeO-vC_ExNiSF-AiU3gOcsrpR7mUQ&s' },
  { name: 'Derawar Fort Sunrise', image: 'https://www.shutterstock.com/image-photo/derawar-fort-large-square-fortress-260nw-1101137141.jpg' },
  { name: 'Makli Necropolis at Dusk', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsEAfTCN1XS8vDvNg1nSuRAjahM0qKuSi_IQ&s' },
  { name: 'Gorakh Hill Stargazing', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR38PGW0okfbHXqvaTiQYT-XR8Pl8RvAfcA3Q&s' },
  { name: 'Kund Malir Beach Overnight Camping', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaeSGucVk_rSn-3U-iF451yUloYXDVztDtOQ&s' },
  { name: 'Astola Island Camping', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMpWpn33fFDo21F8BO556hCNSLg1e9A54cXA&s' },
  { name: 'Hinglaj Mata Pilgrimage', image: 'https://static.toiimg.com/thumb/msid-109525095,imgsize-210290,width-400,resizemode-4/109525095.jpg' },
  { name: 'Multan Ramadan Rooftop Iftar', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQX7IZcS9HdZ352Mk2cevcmvWa2qqeVzGVCYQ&s' },
  { name: 'Naran Trout Fishing at Dawn', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSawwmsJ19YMS8z4hRKQQbn-qB5_9q0PzRzzg&s' },
  { name: 'Thar Desert Overnight Camel Safari', image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/11/d7/cf/f4.jpg' },
  { name: 'Ziarat Ancient Juniper Trees', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6fXzntAHBKoWuaAozWp21NfwCG6d5FCIKVw&s' },
  { name: 'Gilgit Apricot Blossom Villages', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsyruoIYbKfAqu-hx8EtEssC6s7hKBmnQhxQ&s' },
  { name: 'Takht-i-Bahi Night Watchman Tour', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRumiCRGzggu0n-5HnfkhwZWfceQUH0YvJ6Sw&s' },
  { name: 'Katas Raj Hindu Festival Night', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoxZfuszlvOiRJIktQ576Hxk6CwbL9UYlRrQ&s' },
  { name: 'Hoper Glacier Walk', image: 'https://northbackend.northonwheels.com/storage/uploads/Hoper-Glacier-1.jpg' },
  { name: 'Sehwan Thursday Night Dhamaal', image: 'https://northbackend.northonwheels.com/storage/uploads/Hoper-Glacier-1.jpg' },
  { name: 'Margalla Sunset Trail', image: 'https://northbackend.northonwheels.com/storage/uploads/Hoper-Glacier-2.jpg' },
  { name: 'Khanpur Cliff Jumping Spots', image: 'https://northbackend.northonwheels.com/storage/uploads/Hoper-Glacier-1.jpg' },
  { name: 'Simli Dam Night Fishing', image: 'https://northbackend.northonwheels.com/storage/uploads/Hoper-Glacier-2.jpg' },
  { name: 'Anarkali Rare Bookshop', image: 'https://i.dawn.com/primary/2021/10/617dbc242bcf5.jpg' },
  { name: 'Gawalmandi After Midnight', image: 'https://northbackend.northonwheels.com/storage/uploads/Hoper-Glacier-1.jpg' },
  { name: 'Wazir Khan Mosque Before Fajr', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgoJb1e9b0xuODswDC2S14KyC441ECO2tqtQ&s' },
  { name: 'Kemari Fisherman Docks at Dawn', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgoJb1e9b0xuODswDC2S14KyC441ECO2tqtQ&s' },
  { name: 'Burns Road Midnight Haleem', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgoJb1e9b0xuODswDC2S14KyC441ECO2tqtQ&s' },
  { name: 'Saddar Old Irani Cafe', image: 'https://northbackend.northonwheels.com/storage/uploads/Hoper-Glacier-2.jpg' },
  { name: 'Hawks Bay Sea Turtle Night', image: 'https://northbackend.northonwheels.com/storage/uploads/Hoper-Glacier-1.jpg' },
  { name: 'Manora Island at Dawn', image: 'https://i.dawn.com/primary/2021/10/617dbc242bcf5.jpg' },
  { name: 'Peshwari Namkeen Chai at Night', image: 'https://i.dawn.com/primary/2021/10/617dbc242bcf5.jpg' },
  { name: 'Kalash Chilam Joshi Festival', image: 'https://northbackend.northonwheels.com/storage/uploads/Hoper-Glacier-2.jpg' },
  { name: 'Shandur Polo Festival Camp', image: 'https://northbackend.northonwheels.com/storage/uploads/Hoper-Glacier-1.jpg' },
  { name: 'Nathiagali Cloud Forest Walk', image: 'https://northbackend.northonwheels.com/storage/uploads/Hoper-Glacier-2.jpg' },
  { name: 'Attabad Underwater Village', image: 'https://northbackend.northonwheels.com/storage/uploads/Hoper-Glacier-2.jpg' },
  { name: 'Baltit Fort Sunset on Roof', image: 'https://northbackend.northonwheels.com/storage/uploads/Hoper-Glacier-1.jpg' },
];

async function updateHiddenGemsImages() {
  console.log('🎁 Updating hidden gems images...\n');
  let updated = 0;
  let notFound = 0;

  for (const item of updates) {
    const result = await prisma.hiddenGem.updateMany({
      where: { name: { equals: item.name, mode: 'insensitive' } },
      data: { image: item.image },
    });

    if (result.count > 0) {
      console.log(`  ✅ ${item.name}`);
      updated++;
    } else {
      console.log(`  ⚠️  NOT FOUND: ${item.name}`);
      notFound++;
    }
  }

  console.log(`\n✅ Updated: ${updated}  ⚠️  Not found: ${notFound}`);
  await prisma.$disconnect();
}

updateHiddenGemsImages().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
