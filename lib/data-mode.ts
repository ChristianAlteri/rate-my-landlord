/**
 * Data backend priority:
 * 1. NEXT_PUBLIC_USE_MOCK_DATA=true → in-memory POC
 * 2. DATABASE_URL set → CockroachDB / Postgres-compatible (pg)
 * 3. NEXT_PUBLIC_SUPABASE_URL set → Supabase
 * 4. else → POC (local dev without env)
 */
export function isCockroachEnabled(): boolean {
  return typeof process.env.DATABASE_URL === "string" && process.env.DATABASE_URL.trim().length > 0
}

export function isMockDataEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return true
  }
  if (isCockroachEnabled()) {
    return false
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return typeof url !== "string" || url.trim().length === 0
}
