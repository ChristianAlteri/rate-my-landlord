/**
 * POC mode: no Supabase — data lives in an in-memory store (dev / single Node process).
 *
 * Enable explicitly: NEXT_PUBLIC_USE_MOCK_DATA=true
 * Or leave NEXT_PUBLIC_SUPABASE_URL empty (auto POC).
 */
export function isMockDataEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return true
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return typeof url !== "string" || url.trim().length === 0
}
