"use server"

import { revalidatePath } from "next/cache"
import { isMockDataEnabled } from "@/lib/data-mode"
import {
  pocAddProperty,
  pocAddReview,
  pocFindDuplicateProperty,
} from "@/lib/poc-store"
import { isValidUkPostcode, normalizeUkPostcode } from "@/lib/address/uk-postcode"
import { validateReviewComment } from "@/lib/review-validation"

export async function pocSubmitProperty(input: {
  address: string
  postcode: string
  landlord_name: string | null
}): Promise<{ ok: true; id: string } | { ok: false; error: string; existingId?: string }> {
  if (!isMockDataEnabled()) {
    return { ok: false, error: "POC mode is off." }
  }

  const normalizedPostcode = normalizeUkPostcode(input.postcode)
  if (!isValidUkPostcode(normalizedPostcode)) {
    return { ok: false, error: "Enter a valid UK postcode." }
  }
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

  const commentCheck = validateReviewComment(input.comment)
  if (!commentCheck.ok) {
    return { ok: false, error: commentCheck.error }
  }

  pocAddReview(input)
  revalidatePath(`/properties/${input.property_id}`)
  revalidatePath("/")
  revalidatePath("/properties")
  return { ok: true }
}
