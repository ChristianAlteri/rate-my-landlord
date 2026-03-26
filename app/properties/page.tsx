import { queryPropertiesList } from "@/lib/queries/properties"
import { PropertySearch } from "@/components/property-search"

export const dynamic = "force-dynamic"
import { PropertyList } from "@/components/property-list"
import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"

interface Props {
  searchParams: Promise<{ search?: string }>
}

export default async function PropertiesPage({ searchParams }: Props) {
  const { search } = await searchParams
  const propertiesWithRatings = await queryPropertiesList(search)

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="min-h-screen bg-background" tabIndex={-1}>
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {search ? `Results for “${search}”` : "All properties"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {propertiesWithRatings.length}{" "}
              {propertiesWithRatings.length === 1 ? "property" : "properties"} found
            </p>
          </div>

          <div className="mb-8 px-0">
            <PropertySearch
              key={search ?? "default"}
              defaultQuery={search ?? ""}
              variant="page"
            />
          </div>

          <PropertyList properties={propertiesWithRatings} searchQuery={search} />
        </div>

        <Footer />
      </main>
    </>
  )
}
