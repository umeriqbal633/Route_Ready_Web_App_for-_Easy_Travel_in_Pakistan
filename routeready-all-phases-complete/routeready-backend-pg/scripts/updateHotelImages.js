/**
 * Hotels Image Update Script — Updates hotel images without wiping data
 * Run from routeready-backend-pg/: node scripts/updateHotelImages.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  { name: 'Kalam Riverside Hotel', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR_sbvlkalbSCLCG7ojahCjXkF_phfbBSe_Q&s' },
  { name: 'Malam Jabba Hotel', image: 'https://www.pchotels.com/assets/images/4_DJI_0015_copy-2.png' },
  { name: 'LOKAL Rooms Swat', image: 'https://cf.bstatic.com/xdata/images/hotel/max500/369851919.jpg?k=1733458cb7f3462913171352b74f9ed11dcac77322d4a7bb60cc4e4c12293742&o=&hp=1' },
  { name: 'Pearl Continental Peshawar', image: 'https://www.hotelscombined.com/rimg/himg/0b/85/69/agoda-76636-93551772-702954.jpg?width=968&height=607&crop=true' },
  { name: 'Serena Hotel Peshawar', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_WEInnWuz_pyJvCYLfg8GAQrTKcVyRsOtgw&s' },
  { name: 'Pearl Continental Bhurban', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWLvjc8x58eWIBBvi725k-xY8j4P1_JyL8Bg&s' },
  { name: 'Holiday Inn Murree', image: 'https://media-cdn.tripadvisor.com/media/photo-s/0b/60/cf/12/holiday-express-inn.jpg' },
  { name: 'Cecil Hotel Nathiagali', image: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/634704000.jpg?k=0a33f1f198be223f6168761377c681a59428359d47cb6365e6f97827276d3d7c&o=' },
  { name: 'Neelum Valley Guesthouse', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSvzi0q1lnDsx-za55Z21leFjnG3K9srtcaQ&s' },
  { name: 'Kel Village Guesthouse', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjGjSh7BMHUSngR8JM0dtNZAHtDzlAkWo2-w&s' },
  { name: 'Rawalakot Inn', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJaWtEvGZmSLdci7FPj-UpVgJv5jt7q3Hmkw&s' },
  { name: 'Multan Continental Hotel', image: 'https://media-cdn.tripadvisor.com/media/photo-s/21/73/42/54/out-side-view-of-hotel.jpg' },
  { name: 'Hotel One Multan', image: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/289828427.jpg?k=78bd0fd74dba411d1fc3eb33d1eb629f06f23349845b47a70423ff06f8e87a88&o=' },
  { name: 'Quetta Serena Hotel', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_WEInnWuz_pyJvCYLfg8GAQrTKcVyRsOtgw&s' },
  { name: 'Gwadar Beach Hotel', image: 'https://images.trvl-media.com/lodging/19000000/18350000/18341200/18341136/b4fbbb4d_y.jpg' },
  { name: 'Chitral Inn', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1vJ4PZgmwingiJJTDRskHsX__pN010_u1yA&s' },
  { name: 'Kalash Valley Guesthouse', image: 'https://www.apricottours.pk/wp-content/uploads/2017/03/kalash-chitral-tour-packages-3.jpg' },
  { name: 'Serena Hotel Faisalabad', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWLvjc8x58eWIBBvi725k-xY8j4P1_JyL8Bg&s' },
  { name: 'Pearl Continental Rawalpindi', image: 'https://www.pchotels.com/assets/images/1-2.png' },
  { name: 'LOKAL Rooms Karachi', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5t_uROtquTr5cW03V3AjxM2UF964Ix0vCEA&s' },
  { name: 'Karachi Backpackers', image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/30/b0/9d/d6/caption.jpg?w=1200&h=-1&s=1&cx=3039&cy=71&chk=v1_84099a232679eeac1e85' },
  { name: 'Serena Hotel Hunza', image: 'https://image-tc.galaxy.tf/wijpeg-efyc77y4keulp17xm405agw38/hunza-serena-hotel.jpg' },
  { name: 'Hunza Embassy Hotel', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMW-tkF7Uptfj0YKNu4lBpZyK0mlxm136aTw&s' },
  { name: 'Eagles Nest Hotel Hunza', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUvpo1E9FAZ5F6sBrsJs-GgEmwSe4DiqEMdQ&s' },
  { name: 'Luxus Hunza Attabad Lake Resort', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhPZbNYH4cImB_3mWCPp3j6xH2pcz9v4Td8A&s' },
  { name: 'Old Hunza Inn', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8g6gDSEhFUdal3ecm0Od1-tZSC9CN-i1alA&s' },
  { name: 'LOKAL Rooms Hunza', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXo1evt5JnX-Oer-2mqUorlxgGZINKJHs2cg&s' },
  { name: 'Sarai Silk Route Hotel Passu', image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/45/82/a4/hotel-sarai-silk-route.jpg?w=900&h=500&s=1' },
  { name: 'Serena Shigar Fort', image: 'https://q-xx.bstatic.com/xdata/images/hotel/max500/183084859.jpg?k=e706cf8fb63ed0f82b3ecc367d5f00c1f3c77d0e41422e084cb96bcbe5bdc32f&o=' },
  { name: 'Shangrila Resort Skardu', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3lTbvja67B8vpkuoeGaiW60W9bF6RFiDhWw&s' },
  { name: 'Himmel Skardu by Luxus', image: 'https://www.pchotels.com/assets/images/1-2.png' },
  { name: 'LOKAL Rooms Skardu', image: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/671257288.jpg?k=5871552322b7073c912cf634461b644ccb9c8a0f0febd55a5f75e6ab8a308c28&o=' },
  { name: 'Khoj Resorts Shigar', image: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/671257288.jpg?k=5871552322b7073c912cf634461b644ccb9c8a0f0febd55a5f75e6ab8a308c28&o=' },
  { name: 'Gilgit Serena Hotel', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3lTbvja67B8vpkuoeGaiW60W9bF6RFiDhWw&s' },
  { name: 'Fairy Meadows Tent Village', image: 'https://www.pchotels.com/assets/images/1-2.png' },
  { name: 'Naran Tourist Cottage', image: 'https://pix10.agoda.net/hotelImages/35359001/583825230/94ffd6e381db28f7ff4f37154c24e930.jpeg?s=800x600' },
  { name: 'LOKAL Rooms Naran', image: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/671257288.jpg?k=5871552322b7073c912cf634461b644ccb9c8a0f0febd55a5f75e6ab8a308c28&o=' },
  { name: 'Swat Serena Hotel', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3lTbvja67B8vpkuoeGaiW60W9bF6RFiDhWw&s' },
  { name: 'Serena Hotel Islamabad', image: 'https://www.pchotels.com/assets/images/1-2.png' },
  { name: 'Marriott Hotel Islamabad', image: 'https://pix10.agoda.net/hotelImages/35359001/583825230/94ffd6e381db28f7ff4f37154c24e930.jpeg?s=800x600' },
  { name: 'Hotel One Islamabad', image: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/671257288.jpg?k=5871552322b7073c912cf634461b644ccb9c8a0f0febd55a5f75e6ab8a308c28&o=' },
  { name: 'Islamabad Backpackers Hostel', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3lTbvja67B8vpkuoeGaiW60W9bF6RFiDhWw&s' },
  { name: 'LOKAL Rooms Islamabad', image: 'https://www.pchotels.com/assets/images/1-2.png' },
  { name: 'Pearl Continental Lahore', image: 'https://pix10.agoda.net/hotelImages/35359001/583825230/94ffd6e381db28f7ff4f37154c24e930.jpeg?s=800x600' },
  { name: 'Avari Hotel Lahore', image: 'https://www.pchotels.com/assets/images/1-2.png' },
  { name: 'Nishat Hotel Lahore', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3lTbvja67B8vpkuoeGaiW60W9bF6RFiDhWw&s' },
  { name: 'Hotel One Lahore', image: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/671257288.jpg?k=5871552322b7073c912cf634461b644ccb9c8a0f0febd55a5f75e6ab8a308c28&o=' },
  { name: 'Lahore Backpackers Hostel', image: 'https://pix10.agoda.net/hotelImages/35359001/583825230/94ffd6e381db28f7ff4f37154c24e930.jpeg?s=800x600' },
  { name: 'LOKAL Rooms Lahore', image: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/671257288.jpg?k=5871552322b7073c912cf634461b644ccb9c8a0f0febd55a5f75e6ab8a308c28&o=' },
  { name: 'Movenpick Hotel Karachi', image: 'https://pix10.agoda.net/hotelImages/35359001/583825230/94ffd6e381db28f7ff4f37154c24e930.jpeg?s=800x600' },
  { name: 'Pearl Continental Karachi', image: 'https://www.pchotels.com/assets/images/1-2.png' },
  { name: 'Marriott Karachi', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3lTbvja67B8vpkuoeGaiW60W9bF6RFiDhWw&s' },
];

async function updateHotelImages() {
  console.log('🏨 Updating hotel images...\n');
  let updated = 0;
  let notFound = 0;

  for (const item of updates) {
    const result = await prisma.hotel.updateMany({
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

updateHotelImages().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
