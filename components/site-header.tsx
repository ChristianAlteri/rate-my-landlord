import Link from "next/link"
import { SiteHeaderAddProperty } from "@/components/site-header-add-property"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-foreground outline-none ring-offset-background transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-xl"
        >
          RateMyLandlord<span className="text-primary">.</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/properties"
            className="text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-base"
          >
            Search
          </Link>
          <SiteHeaderAddProperty />
        </nav>
      </div>
    </header>
  )
}
