import { getPool } from "@/lib/db/pool"

type PropertyRow = {
  id: string
  address: string
  postcode: string
  landlord_name: string | null
  borough: string | null
  created_at: Date
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
  const pool = getPool()
  const res = await pool.query<{
    id: string
    address: string
    postcode: string
    landlord_name: string | null
    borough: string | null
    created_at: Date
    review_count: string
    avg_rating: string | null
  }>(
    `
    SELECT
      p.id,
      p.address,
      p.postcode,
      p.landlord_name,
      p.borough,
      p.created_at,
      COUNT(r.id)::text AS review_count,
      AVG(r.rating)::text AS avg_rating
    FROM properties p
    LEFT JOIN reviews r ON r.property_id = p.id
    GROUP BY p.id, p.address, p.postcode, p.landlord_name, p.borough, p.created_at
    ORDER BY p.created_at DESC
    LIMIT 6
    `,
  )

  return res.rows.map((row) => {
    const reviewCount = Number.parseInt(row.review_count, 10) || 0
    const avgRating =
      row.avg_rating !== null && row.avg_rating !== ""
        ? Number.parseFloat(row.avg_rating)
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
  })
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
  const pool = getPool()
  const q = search?.trim()

  if (!q) {
    const res = await pool.query<{
      id: string
      address: string
      postcode: string
      landlord_name: string | null
      borough: string | null
      created_at: Date
      review_count: string
      avg_rating: string | null
    }>(
      `
      SELECT
        p.id,
        p.address,
        p.postcode,
        p.landlord_name,
        p.borough,
        p.created_at,
        COUNT(r.id)::text AS review_count,
        AVG(r.rating)::text AS avg_rating
      FROM properties p
      LEFT JOIN reviews r ON r.property_id = p.id
      GROUP BY p.id, p.address, p.postcode, p.landlord_name, p.borough, p.created_at
      ORDER BY p.created_at DESC
      `,
    )
    return res.rows.map((row) => mapListRow(row))
  }

  const needle = `%${q.replace(/%/g, "\\%").replace(/_/g, "\\_")}%`
  const res = await pool.query<{
    id: string
    address: string
    postcode: string
    landlord_name: string | null
    borough: string | null
    created_at: Date
    review_count: string
    avg_rating: string | null
  }>(
    `
    SELECT
      p.id,
      p.address,
      p.postcode,
      p.landlord_name,
      p.borough,
      p.created_at,
      COUNT(r.id)::text AS review_count,
      AVG(r.rating)::text AS avg_rating
    FROM properties p
    LEFT JOIN reviews r ON r.property_id = p.id
    WHERE
      p.address ILIKE $1 ESCAPE '\\'
      OR p.postcode ILIKE $1 ESCAPE '\\'
      OR COALESCE(p.landlord_name, '') ILIKE $1 ESCAPE '\\'
      OR COALESCE(p.borough, '') ILIKE $1 ESCAPE '\\'
    GROUP BY p.id, p.address, p.postcode, p.landlord_name, p.borough, p.created_at
    ORDER BY p.created_at DESC
    `,
    [needle],
  )
  return res.rows.map((row) => mapListRow(row))
}

function mapListRow(row: {
  id: string
  address: string
  postcode: string
  landlord_name: string | null
  borough: string | null
  created_at: Date
  review_count: string
  avg_rating: string | null
}) {
  const reviewCount = Number.parseInt(row.review_count, 10) || 0
  const avgRating =
    row.avg_rating !== null && row.avg_rating !== ""
      ? Number.parseFloat(row.avg_rating)
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
  const pool = getPool()
  const prop = await pool.query<PropertyRow>(
    `SELECT id, address, postcode, landlord_name, borough, created_at FROM properties WHERE id = $1`,
    [id],
  )
  if (prop.rows.length === 0) return null
  const p = prop.rows[0]
  const rev = await pool.query<{
    id: string
    username: string
    rating: number
    comment: string
    created_at: Date
  }>(
    `
    SELECT id, username, rating, comment, created_at
    FROM reviews
    WHERE property_id = $1
    ORDER BY created_at DESC
    `,
    [id],
  )
  return {
    id: p.id,
    address: p.address,
    postcode: p.postcode,
    landlord_name: p.landlord_name,
    borough: p.borough,
    reviews: rev.rows.map((r) => ({
      ...r,
      created_at: r.created_at,
    })),
  }
}

export async function crdbFindDuplicateProperty(
  address: string,
  postcode: string,
): Promise<string | null> {
  const pool = getPool()
  const res = await pool.query<{ id: string }>(
    `
    SELECT id FROM properties
    WHERE lower(trim(address)) = lower(trim($1))
      AND lower(trim(postcode)) = lower(trim($2))
    LIMIT 1
    `,
    [address, postcode],
  )
  return res.rows[0]?.id ?? null
}

export async function crdbInsertProperty(input: {
  address: string
  postcode: string
  landlord_name: string | null
}): Promise<{ id: string }> {
  const pool = getPool()
  const res = await pool.query<{ id: string }>(
    `
    INSERT INTO properties (address, postcode, landlord_name)
    VALUES ($1, $2, $3)
    RETURNING id
    `,
    [input.address, input.postcode, input.landlord_name],
  )
  return { id: res.rows[0].id }
}

export async function crdbInsertReview(input: {
  property_id: string
  username: string
  rating: number
  comment: string
}): Promise<void> {
  const pool = getPool()
  await pool.query(
    `
    INSERT INTO reviews (property_id, username, rating, comment)
    VALUES ($1, $2, $3, $4)
    `,
    [input.property_id, input.username, input.rating, input.comment],
  )
}
