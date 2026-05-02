const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function updateImages() {
  const urls = [
    "https://images.unsplash.com/photo-1627885444155-25e2432fb7f6?auto=format&fit=crop&q=80&w=800", // Hunza / general mountains
    "https://images.unsplash.com/photo-1589417387195-207d57fb4936?auto=format&fit=crop&q=80&w=800", // Badshahi Mosque
    "https://images.unsplash.com/photo-1620215886616-0925af1cbce4?auto=format&fit=crop&q=80&w=800", // Fairy Meadows
    "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?auto=format&fit=crop&q=80&w=800", // Skardu
    "https://images.unsplash.com/photo-1601662998692-a1af4dc08c2a?auto=format&fit=crop&q=80&w=800", // Islamabad Faisal Mosque
    "https://plus.unsplash.com/premium_photo-1697730303664-d621535b91b9?auto=format&fit=crop&q=80&w=800", // Swat
    "https://images.unsplash.com/photo-1634594247854-e0bafaaf44e4?auto=format&fit=crop&q=80&w=800", // Lahore Fort
    "https://images.unsplash.com/photo-1586520739981-8b06606a382d?auto=format&fit=crop&q=80&w=800", // Multan
    "https://images.unsplash.com/photo-1618820625340-0de3c3f25c79?auto=format&fit=crop&q=80&w=800", // Naran
    "https://images.unsplash.com/photo-1621213444648-52210a514d3f?auto=format&fit=crop&q=80&w=800", // Karachi
  ];

  const destinations = await prisma.destination.findMany({ take: 10 });

  for (let i = 0; i < destinations.length; i++) {
    if (i < urls.length) {
      await prisma.destination.update({
        where: { id: destinations[i].id },
        data: { image: urls[i] },
      });
      console.log(`Updated ${destinations[i].name} with image url`);
    }
  }
  console.log("Done updating 10 destinations!");
}

updateImages()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
