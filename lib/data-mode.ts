/**
 * Data backend priority:
 * 1. DATABASE_URL set → CockroachDB (always wins over mock — Vercel serverless has no shared memory)
 * 2. NEXT_PUBLIC_USE_MOCK_DATA=true → in-memory POC (local dev only — NEVER on Vercel)
 * 3. NEXT_PUBLIC_SUPABASE_URL set → Supabase
 * 4. else → POC (local dev without env)
 */
export function isCockroachEnabled(): boolean {
  return typeof process.env.DATABASE_URL === "string" && process.env.DATABASE_URL.trim().length > 0
}

export function isMockDataEnabled(): boolean {
  if (isCockroachEnabled()) {
    return false
  }
  /**
   * In-memory POC cannot work on Vercel: each serverless instance has its own memory.
   * Seed IDs (e.g. aaaaaaaa-…) appear on one instance; creates on another instance → 404 forever.
   */
  if (process.env.VERCEL === "1") {
    return false
  }
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return true
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return typeof url !== "string" || url.trim().length === 0
}
