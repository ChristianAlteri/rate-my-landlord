"use server"

import { UK_LOCATION_RESTRICTION } from "@/lib/address/uk-places"
import { parseUkAddressFromPlace } from "@/lib/address/parse-google-place"

const PLACES_AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete"

function getApiKey(): string | undefined {
  return process.env.GOOGLE_PLACES_API_KEY?.trim() || process.env.GOOGLE_MAPS_API_KEY?.trim()
}

export type AddressSuggestion = {
  placeId: string
  description: string
}

export async function searchAddressSuggestions(
  input: string,
  sessionToken: string,
): Promise<{ ok: true; suggestions: AddressSuggestion[] } | { ok: false; error: string }> {
  const q = input.trim()
  if (q.length < 3) {
    return { ok: true, suggestions: [] }
  }
  if (q.length > 200) {
    return { ok: false, error: "Search text is too long." }
  }

  const key = getApiKey()
  if (!key) {
    return { ok: true, suggestions: [] }
  }

  try {
    const res = await fetch(PLACES_AUTOCOMPLETE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
      },
      body: JSON.stringify({
        input: q,
        includedRegionCodes: ["gb"],
        languageCode: "en-GB",
        regionCode: "GB",
        locationRestriction: UK_LOCATION_RESTRICTION,
        sessionToken,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("Places autocomplete error:", res.status, errText)
      return { ok: false, error: "Address search is temporarily unavailable." }
    }

    const data = (await res.json()) as {
      suggestions?: Array<{
        placePrediction?: {
          placeId?: string
          text?: { text?: string }
        }
      }>
    }

    const suggestions: AddressSuggestion[] = []
    for (const s of data.suggestions ?? []) {
      const pp = s.placePrediction
      if (!pp?.placeId) continue
      suggestions.push({
        placeId: pp.placeId,
        description: pp.text?.text ?? pp.placeId,
      })
    }

    return { ok: true, suggestions }
  } catch (e) {
    console.error(e)
    return { ok: false, error: "Address search failed." }
  }
}

export async function resolvePlaceToAddress(
  placeId: string,
  sessionToken: string,
): Promise<
  | { ok: true; address: string; postcode: string }
  | { ok: false; error: string }
> {
  const key = getApiKey()
  if (!key) {
    return { ok: false, error: "Address lookup is not configured." }
  }

  const encoded = encodeURIComponent(placeId)
  const url = `https://places.googleapis.com/v1/places/${encoded}?languageCode=en-GB&regionCode=GB&sessionToken=${encodeURIComponent(sessionToken)}`

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "addressComponents,formattedAddress",
      },
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("Place details error:", res.status, errText)
      return { ok: false, error: "Could not load that address." }
    }

    const place = (await res.json()) as {
      formattedAddress?: string
      addressComponents?: Array<{
        longText: string
        shortText: string
        types: string[]
      }>
    }

    const formatted = place.formattedAddress ?? ""
    const components = place.addressComponents ?? []

    const parsed = parseUkAddressFromPlace(formatted, components)
    if (!parsed) {
      return {
        ok: false,
        error: "That address isn’t in the UK or doesn’t have a valid UK postcode. Pick another result.",
      }
    }

    return {
      ok: true,
      address: parsed.addressLine.trim(),
      postcode: parsed.postcode,
    }
  } catch (e) {
    console.error(e)
    return { ok: false, error: "Could not load that address." }
  }
}

export async function isAddressSearchConfigured(): Promise<boolean> {
  return Boolean(getApiKey())
}
