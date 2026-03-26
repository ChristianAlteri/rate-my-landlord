import { getPrisma } from "@/lib/prisma"

type PropertyRow = {
  id: string
  address: string
  postcode: string
  landlord_name: string | null
  borough: string | null
  created_at: Date
}

function mapListRow(
  row: PropertyRow & {
    reviews: Array<{ rating: bigint }>
  },
) {
  const reviewCount = row.reviews.length
  const avgRating =
    reviewCount > 0
      ? row.reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviewCount
      : null
  return {
    id: row.id,
    address: row.address,
    postcode: row.postcode,
    landlord_name: row.landlord_name,
    borough: row.borough,
    created_at: row.created_at,
    reviewCount,
    avgRating,
    reviews: [] as Array<{ rating: number }>,
  }
}

export async function crdbQueryHomeProperties(): Promise<
  Array<
    PropertyRow & {
      avgRating: number | null
      reviewCount: number
      reviews: Array<{ rating: number }>
    }
  >
> {
  const rows = await getPrisma().properties.findMany({
    take: 6,
    orderBy: { created_at: "desc" },
    include: { reviews: { select: { rating: true } } },
  })
  return rows.map((row) => mapListRow(row))
}

export async function crdbQueryPropertiesList(search?: string): Promise<
  Array<
    PropertyRow & {
      avgRating: number | null
      reviewCount: number
      reviews: Array<{ rating: number }>
    }
  >
> {
  const q = search?.trim()

  if (!q) {
    const rows = await getPrisma().properties.findMany({
      orderBy: { created_at: "desc" },
      include: { reviews: { select: { rating: true } } },
    })
    return rows.map((row) => mapListRow(row))
  }

  const rows = await getPrisma().properties.findMany({
    where: {
      OR: [
        { address: { contains: q, mode: "insensitive" } },
        { postcode: { contains: q, mode: "insensitive" } },
        { landlord_name: { contains: q, mode: "insensitive" } },
        { borough: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { created_at: "desc" },
    include: { reviews: { select: { rating: true } } },
  })
  return rows.map((row) => mapListRow(row))
}

export async function crdbQueryPropertyDetail(id: string): Promise<{
  id: string
  address: string
  postcode: string
  landlord_name: string | null
  borough: string | null
  reviews: Array<{
    id: string
    username: string
    rating: number
    comment: string
    created_at: Date
  }>
} | null> {
  const p = await getPrisma().properties.findUnique({
    where: { id },
    include: {
      reviews: {
        orderBy: { created_at: "desc" },
      },
    },
  })
  if (!p) return null

  return {
    id: p.id,
    address: p.address,
    postcode: p.postcode,
    landlord_name: p.landlord_name,
    borough: p.borough,
    reviews: p.reviews.map((r) => ({
      id: r.id,
      username: r.username,
      rating: Number(r.rating),
      comment: r.comment,
      created_at: r.created_at,
    })),
  }
}

export async function crdbFindDuplicateProperty(
  address: string,
  postcode: string,
): Promise<string | null> {
  const rows = await getPrisma().$queryRaw<Array<{ id: string }>>`
    SELECT id FROM properties
    WHERE lower(trim(address)) = lower(trim(${address}))
      AND lower(trim(postcode)) = lower(trim(${postcode}))
    LIMIT 1
  `
  return rows[0]?.id ?? null
}

export async function crdbInsertProperty(input: {
  address: string
  postcode: string
  landlord_name: string | null
}): Promise<{ id: string }> {
  const row = await getPrisma().properties.create({
    data: {
      address: input.address,
      postcode: input.postcode,
      landlord_name: input.landlord_name,
    },
    select: { id: true },
  })
  return { id: row.id }
}

export async function crdbInsertReview(input: {
  property_id: string
  username: string
  rating: number
  comment: string
}): Promise<void> {
  await getPrisma().reviews.create({
    data: {
      property_id: input.property_id,
      username: input.username,
      rating: BigInt(input.rating),
      comment: input.comment,
    },
  })
}
