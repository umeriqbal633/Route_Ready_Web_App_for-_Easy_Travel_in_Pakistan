const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkImages() {
  try {
    const destinations = await prisma.destination.findMany({
      select: { name: true, image: true },
      take: 20,
    });
    console.log(
      "Here are the current image URLs in the database for the first 20 destinations:",
    );
    console.table(destinations);
  } catch (error) {
    console.error("Error checking database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImages();
