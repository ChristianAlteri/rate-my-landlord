import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/lib/generated/prisma/client"
import { Pool } from "pg"

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined
  pgPool: Pool | undefined
}

/**
 * Lazy Prisma client so importing this module does not require DATABASE_URL
 * (e.g. Vercel build analyzing routes before env is available to all phases).
 * Call only when Cockroach is enabled and you will query the DB.
 */
export function getPrisma(): InstanceType<typeof PrismaClient> {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  const url = process.env.DATABASE_URL?.trim()
  if (!url) {
    throw new Error("DATABASE_URL is not set")
  }

  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString: url,
      // Vercel serverless: one connection per warm instance avoids exhausting Cockroach connection limits
      max: process.env.VERCEL ? 1 : 8,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 15_000,
    })
  globalForPrisma.pgPool = pool

  const adapter = new PrismaPg(pool)
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
  globalForPrisma.prisma = client
  return client
}
