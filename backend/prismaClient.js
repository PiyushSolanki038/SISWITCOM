const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')

const globalForPrisma = globalThis

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/siswit?schema=public'

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
module.exports = { prisma }
