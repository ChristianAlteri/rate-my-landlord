import { queryPropertyDetail } from "@/lib/queries/properties"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, MapPin, User, ArrowLeft } from "lucide-react"
import { ReviewForm } from "@/components/review-form"
import { ReviewList } from "@/components/review-list"
import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"

interface Props {
  params: Promise<{ id: string }>
}

export default async function PropertyPage({ params }: Props) {
  const { id } = await params
  const property = await queryPropertyDetail(id)

  if (!property) {
    notFound()
  }

  const reviews = property.reviews || []
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
      : null

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="min-h-screen bg-background" tabIndex={-1}>
        <div className="mx-auto max-w-6xl px-4 py-8">
          <Link
            href="/properties"
            className="mb-6 inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4 shrink-0" aria-hidden />
            Back to all properties
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <Card>
                <CardHeader>
                  {avgRating !== null && (
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-primary text-primary" aria-hidden />
                        <span className="text-lg font-semibold">{avgRating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({reviews.length} reviews)</span>
                      </div>
                    </div>
                  )}
                  <CardTitle className="text-2xl">{property.address}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5 shrink-0" aria-hidden />
                    <span>{property.postcode}</span>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <User className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                    <span>
                      Landlord:{" "}
                      <span className="font-medium text-foreground">
                        {property.landlord_name ?? "Not listed"}
                      </span>
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  Reviews ({reviews.length})
                </h2>
                <ReviewList reviews={reviews} />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <ReviewForm propertyId={property.id} />
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  )
}
