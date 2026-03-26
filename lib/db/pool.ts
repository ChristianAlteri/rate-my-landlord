import { Pool } from "pg"

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL?.trim()
    if (!url) {
      throw new Error("DATABASE_URL is not set")
    }
    pool = new Pool({
      connectionString: url,
      max: 8,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    })
  }
  return pool
}
