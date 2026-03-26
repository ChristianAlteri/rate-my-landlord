/** Parsed from Google Places API (New) Place resource */

import { isValidUkPostcode, normalizeUkPostcode } from "@/lib/address/uk-postcode"

export type GoogleAddressComponent = {
  longText: string
  shortText: string
  types: string[]
}

/** Country component must be United Kingdom when present (rejects Ireland, etc.). */
export function isUnitedKingdomPlace(components: GoogleAddressComponent[]): boolean {
  const country = components.find((c) => c.types.includes("country"))
  if (!country) return true
  const cc = country.shortText?.toUpperCase() ?? ""
  return cc === "GB" || cc === "UK"
}

/**
 * Build street line + UK postcode from Places addressComponents + formattedAddress.
 */
export function parseUkAddressFromPlace(
  formattedAddress: string,
  components: GoogleAddressComponent[],
): { addressLine: string; postcode: string } | null {
  if (!isUnitedKingdomPlace(components)) return null

  const postcodeRaw =
    components.find((c) => c.types.includes("postal_code"))?.longText?.trim() ?? ""
  if (!postcodeRaw) return null

  const postcode = normalizeUkPostcode(postcodeRaw)
  if (!isValidUkPostcode(postcode)) return null

  const streetNumber = components.find((c) => c.types.includes("street_number"))?.longText ?? ""
  const route = components.find((c) => c.types.includes("route"))?.longText ?? ""
  const subpremise = components.find((c) => c.types.includes("subpremise"))?.longText ?? ""
  const premise = components.find((c) => c.types.includes("premise"))?.longText ?? ""

  const building = [subpremise, premise].filter(Boolean).join(", ")
  const street = [streetNumber, route].filter(Boolean).join(" ").trim()
  let addressLine = [building, street].filter(Boolean).join(", ").trim()

  if (!addressLine) {
    addressLine = stripPostcodeFromFormatted(formattedAddress, postcode)
  }

  if (!addressLine) {
    addressLine = formattedAddress.split(",")[0]?.trim() ?? ""
  }

  return { addressLine, postcode }
}

function stripPostcodeFromFormatted(formattedAddress: string, postcode: string): string {
  const escaped = postcode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*")
  const re = new RegExp(`,?\\s*${escaped}\\b`, "i")
  return formattedAddress.replace(re, "").replace(/,\s*$/, "").trim()
}
