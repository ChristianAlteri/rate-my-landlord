import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, MessageSquare, User, Plus } from "lucide-react"
import { AddPropertyForm } from "@/components/add-property-form"

interface Property {
  id: string
  address: string
  postcode: string
  landlord_name: string | null
  avgRating: number | null
  reviewCount: number
}

interface PropertyListProps {
  properties: Property[]
  searchQuery?: string
}

export function PropertyList({ properties, searchQuery }: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Plus className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground">Property not listed yet?</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Be the first to add it! Help other tenants by listing this property.
        </p>
        <div className="mt-6">
          <AddPropertyForm 
            defaultAddress={searchQuery}
            trigger={
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Add This Property
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <Link key={property.id} href={`/properties/${property.id}`}>
          <Card className="group transition-all hover:shadow-md hover:border-primary/30">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {property.avgRating !== null && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-primary text-primary" aria-hidden />
                      <span className="font-medium">{property.avgRating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({property.reviewCount} reviews)</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {property.address}
                    </p>
                    <p className="text-sm text-muted-foreground">{property.postcode}</p>
                  </div>
                </div>
                
                {property.landlord_name && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="font-medium text-foreground">{property.landlord_name}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-primary font-medium">
                <MessageSquare className="h-4 w-4" />
                Leave a review
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
