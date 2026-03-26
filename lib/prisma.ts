import { PrismaClient } from "@/lib/generated/prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined
}

export function getPrisma(): InstanceType<typeof PrismaClient> {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
  globalForPrisma.prisma = client
  return client
}
