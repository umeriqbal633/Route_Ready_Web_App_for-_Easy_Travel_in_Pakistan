/**
 * Image Update Script — Updates destination images without wiping data
 * Run from routeready-backend-pg/: node scripts/updateImages.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  // image = card view + main hero, gallery[0] = detail page thumbnails
  { name: 'Faisal Mosque',            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuyE7LQ_-1ykXHSQAqb8CJZA2CBr6JV31R1Q&s', gallery: [] },
  { name: 'Daman-e-Koh',              image: 'https://propakistani.pk/wp-content/uploads/2021/08/Daman-e-Koh-1.jpg', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8MTrBE43gcy5uuvWYD-Ic0ukOscdzcNfUgg&s'] },
  { name: 'Pakistan Monument',        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlLt1uuoCpm9Pqpk6QE3UURQnmBS0bdM5bng&s', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwfmfnVagLjVxXHDtGZ7UQAgD2h2wG8OdcoA&s'] },
  { name: 'Margalla Hills National Park', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSf8i6clZ_huHdD_zqs2GxOehWSX7MRgf4SUA&s', gallery: ['https://propakistani.pk/proproperty/wp-content/uploads/2023/10/Margalla-Hills-National-Park.jpg'] },
  { name: 'Badshahi Mosque',          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt2qYaFu9u0FYOQq0Fl75Z0VqD56wvB2KzqQ&s', gallery: [] },
  { name: 'Lahore Fort',              image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyHCMy83EbG4H0xbMkmoPlmT6pePI09nDdhQ&s', gallery: [] },
  { name: 'Wagah Border Ceremony',    image: 'https://images.travelandleisureasia.com/wp-content/uploads/sites/2/2023/01/24155424/Wagah-Border-1-1.jpg?tr=w-1200,q-60', gallery: [] },
  { name: 'Gawalmandi Food Street',   image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROq1txhcuCRJhEWM7Pc5KnMlMC47r_-_u4sg&s', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTduJN7iak-QyNh05bQXd-0u3B-fzco6OjPEA&s'] },
  { name: 'Lahore Fort Road Food Street', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROq1txhcuCRJhEWM7Pc5KnMlMC47r_-_u4sg&s', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTduJN7iak-QyNh05bQXd-0u3B-fzco6OjPEA&s'] },
  { name: 'Rakaposhi Base Camp',      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9eW4WtcQSOhW1heX1EdmU1lYymK_voC-AzA&s', gallery: [] },
  { name: 'Attabad Lake',             image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_vWdMW2aY1XWuzjaj5jGaUCFQ9CWRY8zsoA&s', gallery: [] },
  { name: 'Baltit Fort',              image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRv2vjgFcdYupDhzJm2ai3IAebyuZrGDcwBEQ&s', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwabohZJxnqRaw4fhWtDi55OGu7JqxC45aag&s'] },
  { name: 'Passu Cones',              image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5C2IAudll1Umy02F7aso4tURGIJvXNgfMvw&s', gallery: [] },
  { name: 'Quaid-e-Azam Mausoleum',  image: 'https://stdc.gos.pk/wp-content/uploads/2024/10/Mazar-e-Quaid-Canvas-16x20-1-scaled.jpg', gallery: ['https://chakorventures.com/wp-content/uploads/2025/10/mazar-e-quaid-exterior-view.jpg'] },
  { name: 'Walled City of Lahore',    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpMCxh8LulglgU8L94ZaUazMgC-njltDF8Qg&s', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0J3kM1lym80Ge6tDj4qqs69DLPp585tYkaw&s'] },
  { name: 'Karakoram Highway',        image: 'https://cdn.lambus.com/inspirations/67c58cc2a8d32a67c412845e/cover_photo/8a84b2d8-b57b-4309-6ddd-6a0345125a5a.jpeg?width=1800', gallery: [] },
  { name: 'K2 Base Camp',             image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPLSkTjg6qRsqDncERd8F4WCCEsC-oWQG29A&s', gallery: [] },
  { name: 'Concordia',                image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/3b/ee/38/view-from-concordia-motel.jpg?w=1000&h=1000&s=1', gallery: [] },
  { name: 'Nanga Parbat Base Camp',   image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFYWA0otGfruBoY2UxYL74iKZsdLDdRNIa_g&s', gallery: [] },
  { name: 'Fairy Meadows',            image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/d0/91/51/mesmerizing-view-of-fairy.jpg?w=800&h=-1&s=1', gallery: [] },
  { name: 'Saif-ul-Malook Lake',      image: 'https://visitsilkroad.org/wp-content/uploads/2021/04/Saif-Ul-Malook-Lake-featured_image2.jpg', gallery: [] },
  { name: 'Deosai National Park',     image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOXa880po1MfDrxTdu4lBK9rGfHHEwrkByIw&s', gallery: [] },
  { name: 'Shangrila Resort',         image: 'https://ik.imgkit.net/3vlqs5axxjf/external/http://images.ntmllc.com/v4/hotel/M57/M57472/M57472_EXT_Z47046.JPG?tr=w-1200%2Cfo-auto', gallery: ['https://shangrilaresorts.com.pk/storage/2020/11/PHOTO-2020-08-29-14-56-32-1024x768.jpg'] },
  { name: 'Naltar Valley',            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCgbZyYjeIK30e6dWUJBjInipEuoizUumjeQ&s', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmCX7ehZJ3XwkZ1Nt_HWXtvGOdRR2KeiBXuQ&s'] },
  { name: 'Shigar Fort',              image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRolB8wvrWQWuIScUDbtbCjX1HiBRzbsJVZEg&s', gallery: [] },
  { name: 'Phander Valley',           image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpj3DqXbn5t8hnaVCZxBPpX0WxnitnYiCBsw&s', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQM8dmFRSvetmO3fFJjN7MO73IlxgaRNNpEUw&s'] },
  { name: 'Katpana Cold Desert',      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw1O6Qo0YrSEALq86ud-SDtUjEDKwSHT2iCQ&s', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-Rv5YZ6P4oYJFiqLQN6aAlhnHDHJ3LI7lQA&s'] },
  { name: 'Deosai Sheosar Lake',      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtBHURwoG75qgF_d_hHsxmTqWPeVuNYPJ8ng&s', gallery: [] },
  { name: 'Skardu Valley',            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIW77apADFEhy3fP27NievUqB7ycvn_zfJRA&s', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqCZUN3QfCpHP1TGrV2SBRUE_IlqZhZWcFSA&s'] },
  { name: 'Hushe Valley',             image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsz9lvq2dQVJx92fw7ic67vc2zsy02BRipUw&s', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGOZ1cdYD9S5a4-jMFGceUQXw5rzN0sx0-oQ&s'] },
  { name: 'Neelum Valley',            image: 'https://res.cloudinary.com/dyiffrkzh/image/upload/c_fill,f_auto,fl_progressive.strip_profile,g_center,h_400,q_auto,w_700/v1718952554/banbanjara/j4gff29jmaljv4bntd3z.jpg', gallery: [] },
  { name: 'Ratti Gali Lake',          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3uFknnsyGKfe-fpg8cCA26zymXpyae_zvYg&s', gallery: [] },
  { name: 'Arang Kel',                image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5i-6yvvN5bO4T9fR9HSQy2Pf1byVR8EIGpQ&s', gallery: [] },
  { name: 'Leepa Valley',             image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7qp42ZEJ8FMnpDk7M4m9ULKuN--dDUAi4tA&s', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTn4IPG2aXIcpCNOetP5sKf4VXzlcgudnLTJA&s'] },
  { name: 'Rohtas Fort',              image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUpS_qfll-ZZkvo8aL2xmaFPidy3DRv7brMA&s', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXH5UNbtw0y38WbGlHBU3WhaOvfappuxOtng&s'] },
  { name: 'Derawar Fort',             image: 'https://www.pakistanhc.lk/wp-content/uploads/2018/10/Derawar-Fort-Bahawalpur-960x640.jpg', gallery: [] },
  { name: 'Shah Rukn-e-Alam Shrine',  image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcjfRj7-B78PIfxIVWkVoem0qL0zxONpFlsQ&s', gallery: [] },
  { name: 'Makran Coastal Highway',   image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSf17vwWl2S1laOg72Ho_a-RwoPj6wWOwOOeg&s', gallery: [] },
  { name: 'Kund Malir Beach',         image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAjDqVTTnfbx8sfAlaRY25jLauVeMPOmaLHg&s', gallery: [] },
  { name: 'Hingol National Park',     image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7tEGS_0NCREH49wmYhSjYj8bcQTjGIJsA9Q&s', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSv6mnDwSqhkhUjsBHSbwuxGx71OccBfS3Z3g&s'] },
  { name: 'Astola Island',            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwuo4krZdp1mTTzyk5v2j7ZxCyjtCPT8AJWQ&s', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzbYde5TcKp2mn7KGuArVBwjaTUO-CHJ6P3w&s'] },
  { name: 'Sehwan Sharif',            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMkEYQNqcG26d-wpI1TJlFWh1CGumXPXfMgQ&s', gallery: [] },
  { name: 'Mohenjo-Daro',             image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4sWmVzwKol_BSx91wdH7p5wQVVi2STVoITA&s', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4ioNZrqVV6BNN1ou8heKeZeHpM52z_PkpfQ&s'] },
  { name: 'Ranikot Fort',             image: 'https://taxilamuseum.com/wp-content/uploads/2023/08/Rohtas-Fort.jpg', gallery: ['https://www.aljazeera.com/wp-content/uploads/2019/06/665003303001_6044014223001_6044018988001-th.jpeg?resize=1200%2C675'] },
  { name: 'Shah Jahan Mosque Thatta', image: 'https://cdn-blog.zameen.com/blog/wp-content/uploads/2019/08/cover-image-28.jpg', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7oJBkdpHYOklr1sXjHTPIhnxkSg2DwquJWA&s'] },
  { name: 'Swat Valley',              image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7sMkjLQDqjJKy0lXDHCEGJBIVmlezpd-G0g&s', gallery: [] },
  { name: 'Kalam Valley',             image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrDYkB6KnOeRPGvY-vLxdBI4F2dFS7v7V-bw&s', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRb1aO8O_39nXTjWXDL3DZaHa07X21F8ssVwA&s'] },
  { name: 'Mahodand Lake',            image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/6a/b0/60/mahodand-lake-swat-kalam.jpg?w=800&h=400&s=1', gallery: [] },
  { name: 'Chitral Valley',           image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0NnNJHeXRbS1ulHn70t371sNuC7o8smG2aA&s', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKjioTDgGHLgDLcHpF6ZO0fAGtaNE7yFcAkw&s'] },
  { name: 'Kalash Valley',            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnHB0eXF74YtZ-nmHY0HOy4loH-ITky_QHdg&s', gallery: [] },
  { name: 'Shandur Pass',             image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI3SdjAjjMRI63gNYkzg2o3uirPiLMH0KN4Q&s', gallery: [] },
  { name: 'Babusar Pass',             image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/81/61/3e/babusar-pass.jpg?w=900&h=-1&s=1', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMvw6zi7c6MgbmPKNbRkjbLFkNHHGDl1-Opg&s'] },
  { name: 'Shogran',                  image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlyjD7yTZ-cPOpX8jv3AmHxeIPA5kBSjqQ3A&s', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5IPxhdHNrQ_va4uVlr0jjKuk49XBXdtev-Q&s'] },
  { name: 'Kumrat Valley',            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZY2_gbAatrQ46aCcwx83g9lW6U_C0QJLuWA&s', gallery: ['https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/d9/3d/64/kumrat-urdu-is-a-valley.jpg?w=900&h=500&s=1'] },
  { name: 'Khanpur Dam',              image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7srzp_V3Q5CipmKZaPbGVOX2wjCSHp-3Zqw&s', gallery: ['https://cdn-blog.zameen.com/blog/wp-content/uploads/2020/07/coverkhanpur1.jpg'] },
  { name: 'Taxila Archaeological Site', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1Uh-s8CelRAn3Th16pyaX_2lqPAvzFuShrg&s', gallery: ['https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/fa/2c/d8/taxila.jpg?w=1200&h=-1&s=1'] },
  { name: 'Takht-i-Bahi',            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHu3_vCt0SZEJUBr5--BWRJDclEoMliFwhWA&s', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjY9xBtO9ILNaJRdguZj3gxVWXOAJTaiBJLg&s'] },
  { name: 'Peshawar Museum',          image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Peshawar_Museum_Hall.jpg/330px-Peshawar_Museum_Hall.jpg', gallery: ['https://i.dawn.com/primary/2014/08/5402430b92598.jpg'] },
  { name: 'Wazir Khan Mosque',        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxrVYnVQip3E9As8dwcHEcgxL3u_CL1fGidg&s', gallery: [] },
  { name: 'Altit Fort',               image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/44/a1/60/altit-fort.jpg?w=1200&h=1200&s=1', gallery: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6_69RiANQ4xfL7xpD1Q4uNhZL5-rOfLCH9A&s'] },
  { name: 'Hussaini Suspension Bridge', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdzl7TwAb_-ZKs_buoggoATQYXbCgecA-9zQ&s', gallery: ['https://upload.wikimedia.org/wikipedia/commons/6/6d/The_bridge_of_Shepherds_-_Hussaini_Suspension_Bridge.jpg'] },
  { name: 'Hunza Valley',             image: 'https://res.cloudinary.com/jerrick/image/upload/c_scale,f_jpg,q_auto/643599b38d0197001d05f18f.jpg', gallery: [] },
  { name: 'Khunjerab Pass',           image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL0OTf5emF4W9xchE39ZU8tRbjXuDDqxmUdg&s', gallery: [] },
];

async function updateImages() {
  console.log('🖼️  Updating destination images...\n');
  let updated = 0;
  let notFound = 0;

  for (const item of updates) {
    const gallery = item.gallery.length > 0 ? item.gallery : [item.image];
    const result = await prisma.destination.updateMany({
      where: { name: { equals: item.name, mode: 'insensitive' } },
      data: { image: item.image, gallery },
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

updateImages().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
