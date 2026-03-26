import { queryHomeProperties } from "@/lib/queries/properties"
import { Hero } from "@/components/hero"

export const dynamic = "force-dynamic"
import { PropertySearch } from "@/components/property-search"
import { FeaturedProperties } from "@/components/featured-properties"
import { HowItWorks } from "@/components/how-it-works"
import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"

export default async function Home() {
  const propertiesWithRatings = await queryHomeProperties()

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="min-h-screen bg-background" tabIndex={-1}>
      <Hero />
      <PropertySearch variant="hero" />
      <FeaturedProperties properties={propertiesWithRatings} />
      <HowItWorks />
      <Footer />
      </main>
    </>
  )
}
