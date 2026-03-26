import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star, MapPin, MessageSquare } from "lucide-react"

interface Property {
  id: string
  address: string
  postcode: string
  landlord_name: string | null
  avgRating: number | null
  reviewCount: number
}

interface FeaturedPropertiesProps {
  properties: Property[]
}

export function FeaturedProperties({ properties }: FeaturedPropertiesProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Recent Properties
        </h2>
        <p className="text-muted-foreground">
          See what other tenants are saying about their landlords
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Link key={property.id} href={`/properties/${property.id}`}>
            <Card className="group h-full transition-all hover:border-primary/30 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-end gap-2">
                  {property.avgRating !== null && (
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Star className="h-4 w-4 fill-primary text-primary" aria-hidden />
                      {property.avgRating.toFixed(1)}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {property.address}
                      </p>
                      <p className="text-sm text-muted-foreground">{property.postcode}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t pt-3">
                  {property.landlord_name ? (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{property.landlord_name}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Unknown</p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    {property.reviewCount}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link 
          href="/properties" 
          className="inline-flex items-center text-primary hover:underline font-medium"
        >
          View all properties
          <span className="ml-1">&rarr;</span>
        </Link>
      </div>
    </section>
  )
}
