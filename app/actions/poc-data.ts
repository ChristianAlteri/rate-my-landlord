"use server"

import { revalidatePath } from "next/cache"
import { isMockDataEnabled } from "@/lib/data-mode"
import {
  pocAddProperty,
  pocAddReview,
  pocFindDuplicateProperty,
} from "@/lib/poc-store"

export async function pocSubmitProperty(input: {
  address: string
  postcode: string
  landlord_name: string | null
}): Promise<{ ok: true; id: string } | { ok: false; error: string; existingId?: string }> {
  if (!isMockDataEnabled()) {
    return { ok: false, error: "POC mode is off." }
  }

  const normalizedPostcode = input.postcode.trim().toUpperCase().replace(/\s+/g, " ")
  const existingId = pocFindDuplicateProperty(input.address, normalizedPostcode)
  if (existingId) {
    return { ok: false as const, error: "duplicate", existingId }
  }

  const { id } = pocAddProperty({
    address: input.address.trim(),
    postcode: normalizedPostcode,
    landlord_name: input.landlord_name,
  })

  revalidatePath("/")
  revalidatePath("/properties")
  return { ok: true, id }
}

export async function pocSubmitReview(input: {
  property_id: string
  username: string
  rating: number
  comment: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isMockDataEnabled()) {
    return { ok: false, error: "POC mode is off." }
  }

  pocAddReview(input)
  revalidatePath(`/properties/${input.property_id}`)
  revalidatePath("/")
  revalidatePath("/properties")
  return { ok: true }
}
