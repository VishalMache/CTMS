// ============================================================
// Shared Prisma Client Singleton
// Prevents multiple PrismaClient instances exhausting the
// Supabase connection pool (MaxClientsInSessionMode error)
// ============================================================

const { PrismaClient } = require('@prisma/client');

const prisma = global.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    global.__prisma = prisma;
}

module.exports = prisma;
