import { randomUUID } from "crypto"

export interface PocProperty {
  id: string
  address: string
  postcode: string
  landlord_name: string | null
  borough: string | null
  created_at: string
}

export interface PocReview {
  id: string
  property_id: string
  username: string
  rating: number
  comment: string
  created_at: string
}

type Store = { properties: PocProperty[]; reviews: PocReview[] }

const globalForPoc = globalThis as typeof globalThis & { __landlordReviewsPocStore?: Store }

const SEED_NOW = new Date("2025-01-15T12:00:00.000Z").toISOString()

function seed(): Store {
  const p1 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1"
  const p2 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2"
  const p3 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3"
  return {
    properties: [
      {
        id: p1,
        address: "42 Victoria Road",
        postcode: "E8 3QQ",
        landlord_name: "Private Owner",
        borough: "Hackney",
        created_at: SEED_NOW,
      },
      {
        id: p2,
        address: "12 Shadwell Steps",
        postcode: "E1 2JP",
        landlord_name: "Managed by Foxtons",
        borough: "Tower Hamlets",
        created_at: SEED_NOW,
      },
      {
        id: p3,
        address: "9 Larkhall Rise",
        postcode: "SW4 6HS",
        landlord_name: "Housing Association",
        borough: "Lambeth",
        created_at: SEED_NOW,
      },
    ],
    reviews: [
      {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1",
        property_id: p1,
        username: "north-london-renter",
        rating: 4,
        comment: "Responsive on repairs. Deposit returned within two weeks.",
        created_at: SEED_NOW,
      },
      {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2",
        property_id: p1,
        username: "former-tenant-e8",
        rating: 3,
        comment: "Bit of damp in winter but fair on rent.",
        created_at: SEED_NOW,
      },
      {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3",
        property_id: p2,
        username: "shadwell-local",
        rating: 5,
        comment: "Best letting experience I’ve had in London.",
        created_at: SEED_NOW,
      },
    ],
  }
}

export function getPocStore(): Store {
  if (!globalForPoc.__landlordReviewsPocStore) {
    globalForPoc.__landlordReviewsPocStore = seed()
  }
  return globalForPoc.__landlordReviewsPocStore
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ")
}

function normPostcode(pc: string): string {
  return pc.trim().toUpperCase().replace(/\s+/g, " ")
}

export function pocFindDuplicateProperty(address: string, postcode: string): string | null {
  const store = getPocStore()
  const a = norm(address)
  const pc = normPostcode(postcode)
  const hit = store.properties.find(
    (p) => norm(p.address) === a && normPostcode(p.postcode) === pc,
  )
  return hit?.id ?? null
}

export function pocAddProperty(input: {
  address: string
  postcode: string
  landlord_name: string | null
}): { id: string } {
  const store = getPocStore()
  const id = randomUUID()
  const row: PocProperty = {
    id,
    address: input.address.trim(),
    postcode: normPostcode(input.postcode),
    landlord_name: input.landlord_name,
    borough: null,
    created_at: new Date().toISOString(),
  }
  store.properties.unshift(row)
  return { id }
}

export function pocAddReview(input: {
  property_id: string
  username: string
  rating: number
  comment: string
}): void {
  const store = getPocStore()
  const row: PocReview = {
    id: randomUUID(),
    property_id: input.property_id,
    username: input.username,
    rating: input.rating,
    comment: input.comment,
    created_at: new Date().toISOString(),
  }
  store.reviews.push(row)
}

export function pocListPropertiesWithRatings(options: {
  limit?: number
  search?: string
}): Array<
  PocProperty & {
    reviews: Array<{ rating: number }>
    avgRating: number | null
    reviewCount: number
  }
> {
  const store = getPocStore()
  let list = [...store.properties]

  const q = options.search?.trim()
  if (q) {
    const needle = norm(q)
    list = list.filter((p) => {
      const hay = [
        p.address,
        p.postcode,
        p.landlord_name ?? "",
        p.borough ?? "",
      ]
        .join(" ")
        .toLowerCase()
      return hay.includes(needle)
    })
  }

  list.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  if (typeof options.limit === "number") {
    list = list.slice(0, options.limit)
  }

  return list.map((property) => {
    const reviews = store.reviews.filter((r) => r.property_id === property.id)
    const ratingOnly = reviews.map((r) => ({ rating: r.rating }))
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : null
    return {
      ...property,
      reviews: ratingOnly,
      avgRating,
      reviewCount: reviews.length,
    }
  })
}

export function pocGetPropertyWithReviews(
  id: string,
): (PocProperty & { reviews: PocReview[] }) | null {
  const store = getPocStore()
  const property = store.properties.find((p) => p.id === id)
  if (!property) return null
  const reviews = store.reviews
    .filter((r) => r.property_id === id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return { ...property, reviews }
}
