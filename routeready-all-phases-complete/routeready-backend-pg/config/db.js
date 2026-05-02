/**
 * Prisma Client
 * Single instance of PrismaClient for the entire app
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

// Test connection
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL Connected via Neon');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };
