import { isMockDataEnabled } from "@/lib/data-mode"
import {
  pocGetPropertyWithReviews,
  pocListPropertiesWithRatings,
} from "@/lib/poc-store"
import { createClient } from "@/lib/supabase/server"

type PropertyWithRatingRows = {
  id: string
  address: string
  postcode: string
  landlord_name: string | null
  borough: string | null
  created_at?: string
  reviews?: Array<{ rating: number }>
  avgRating: number | null
  reviewCount: number
}

function mapSupabaseToView(
  properties:
    | Array<{
        id: string
        address: string
        postcode: string
        landlord_name: string | null
        borough: string | null
        created_at?: string
        reviews?: Array<{ rating: number }> | null
      }>
    | null
    | undefined,
): PropertyWithRatingRows[] {
  if (!properties) return []
  return properties.map((property) => {
    const reviews = property.reviews || []
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
          reviews.length
        : null
    return {
      ...property,
      avgRating,
      reviewCount: reviews.length,
    }
  })
}

export async function queryHomeProperties(): Promise<PropertyWithRatingRows[]> {
  if (isMockDataEnabled()) {
    return pocListPropertiesWithRatings({ limit: 6 })
  }

  const supabase = await createClient()
  const { data: properties } = await supabase
    .from("properties")
    .select(
      `
      *,
      reviews(rating)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(6)

  return mapSupabaseToView(properties)
}

export async function queryPropertiesList(search?: string): Promise<PropertyWithRatingRows[]> {
  if (isMockDataEnabled()) {
    return pocListPropertiesWithRatings({ search })
  }

  const supabase = await createClient()

  let query = supabase
    .from("properties")
    .select(
      `
      *,
      reviews(rating)
    `,
    )
    .order("created_at", { ascending: false })

  if (search) {
    query = query.or(
      `address.ilike.%${search}%,postcode.ilike.%${search}%,landlord_name.ilike.%${search}%,borough.ilike.%${search}%`,
    )
  }

  const { data: properties } = await query
  return mapSupabaseToView(properties)
}

export type PropertyDetail = {
  id: string
  address: string
  postcode: string
  landlord_name: string | null
  borough: string | null
  reviews: Array<{
    id: string
    username: string
    rating: number
    comment?: string
    content?: string
    created_at: string
  }>
}

export async function queryPropertyDetail(id: string): Promise<PropertyDetail | null> {
  if (isMockDataEnabled()) {
    const row = pocGetPropertyWithReviews(id)
    if (!row) return null
    const { reviews, ...property } = row
    return {
      ...property,
      reviews: reviews.map((r) => ({
        id: r.id,
        username: r.username,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
      })),
    }
  }

  const supabase = await createClient()
  const { data: property, error } = await supabase
    .from("properties")
    .select(
      `
      *,
      reviews(*)
    `,
    )
    .eq("id", id)
    .single()

  if (error || !property) return null

  const row = property as PropertyDetail & { reviews?: PropertyDetail["reviews"] }
  return {
    id: row.id,
    address: row.address,
    postcode: row.postcode,
    landlord_name: row.landlord_name,
    borough: row.borough,
    reviews: row.reviews ?? [],
  }
}
