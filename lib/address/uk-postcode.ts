/**
 * UK postcode validation and normalisation (single canonical spacing).
 * @see https://ideal-postcodes.co.uk/guides/postcode-regex (broad pattern)
 */

/** Broad UK outward + inward (incl. London EC1A, SW1A, etc.) */
const UK_POSTCODE_LOOSE =
  /^(GIR\s*0AA|[A-Z]{1,2}\d[\dA-Z]{0,2}\s*\d[A-Z]{2})$/i

/**
 * Normalise to outward + inward with a single space, uppercase.
 */
export function normalizeUkPostcode(input: string): string {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, "")
  if (cleaned === "GIR0AA") return "GIR 0AA"
  if (cleaned.length < 5) return input.trim().toUpperCase().replace(/\s+/g, " ")
  const inward = cleaned.slice(-3)
  const outward = cleaned.slice(0, -3)
  return `${outward} ${inward}`
}

export function isValidUkPostcode(raw: string): boolean {
  const norm = normalizeUkPostcode(raw)
  return UK_POSTCODE_LOOSE.test(norm.replace(/\s+/g, " ").trim())
}
