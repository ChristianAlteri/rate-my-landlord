"use server"

import { revalidatePath } from "next/cache"
import { Prisma } from "@/lib/generated/prisma/client"
import { isCockroachEnabled, isMockDataEnabled } from "@/lib/data-mode"
import {
  crdbFindDuplicateProperty,
  crdbInsertProperty,
  crdbInsertReview,
} from "@/lib/db/cockroach"
import { createClient } from "@/lib/supabase/server"
import { pocSubmitProperty, pocSubmitReview } from "@/app/actions/poc-data"
import { isValidUkPostcode, normalizeUkPostcode } from "@/lib/address/uk-postcode"
import { validateReviewComment } from "@/lib/review-validation"

export async function submitProperty(input: {
  address: string
  postcode: string
  landlord_name: string | null
}): Promise<{ ok: true; id: string } | { ok: false; error: string; existingId?: string }> {
  if (isMockDataEnabled()) {
    return pocSubmitProperty(input)
  }

  const normalizedPostcode = normalizeUkPostcode(input.postcode)
  if (!isValidUkPostcode(normalizedPostcode)) {
    return { ok: false, error: "Enter a valid UK postcode." }
  }
  const address = input.address.trim()

  if (isCockroachEnabled()) {
    try {
      const existingId = await crdbFindDuplicateProperty(address, normalizedPostcode)
      if (existingId) {
        return { ok: false as const, error: "duplicate", existingId }
      }
      const { id } = await crdbInsertProperty({
        address,
        postcode: normalizedPostcode,
        landlord_name: input.landlord_name,
      })
      revalidatePath("/")
      revalidatePath("/properties")
      return { ok: true, id }
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        const dup = await crdbFindDuplicateProperty(address, normalizedPostcode)
        if (dup) return { ok: false, error: "duplicate", existingId: dup }
        return { ok: false, error: "This property already exists." }
      }
      const msg = e instanceof Error ? e.message : "Could not add property."
      return { ok: false, error: msg }
    }
  }

  const supabase = await createClient()
  const { data: existing } = await supabase
    .from("properties")
    .select("id")
    .ilike("address", address)
    .ilike("postcode", normalizedPostcode)
    .maybeSingle()

  if (existing) {
    return { ok: false, error: "duplicate", existingId: existing.id }
  }

  const { data, error: insertError } = await supabase
    .from("properties")
    .insert({
      address,
      postcode: normalizedPostcode,
      landlord_name: input.landlord_name,
    })
    .select("id")
    .single()

  if (insertError) {
    if (insertError.code === "23505") {
      return { ok: false, error: "This property already exists in the database." }
    }
    return { ok: false, error: insertError.message }
  }

  revalidatePath("/")
  revalidatePath("/properties")
  return { ok: true, id: data!.id }
}

export async function submitReview(input: {
  property_id: string
  username: string
  rating: number
  comment: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const commentCheck = validateReviewComment(input.comment)
  if (!commentCheck.ok) {
    return { ok: false, error: commentCheck.error }
  }

  const payload = { ...input, comment: input.comment.trim() }

  if (isMockDataEnabled()) {
    return pocSubmitReview(payload)
  }

  if (isCockroachEnabled()) {
    try {
      await crdbInsertReview(payload)
      revalidatePath(`/properties/${input.property_id}`)
      revalidatePath("/")
      revalidatePath("/properties")
      return { ok: true }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to submit review."
      return { ok: false, error: msg }
    }
  }

  const supabase = await createClient()
  const { error: submitError } = await supabase.from("reviews").insert({
    property_id: payload.property_id,
    username: payload.username,
    rating: payload.rating,
    comment: payload.comment,
  })

  if (submitError) {
    return { ok: false, error: submitError.message }
  }

  revalidatePath(`/properties/${input.property_id}`)
  revalidatePath("/")
  revalidatePath("/properties")
  return { ok: true }
}
