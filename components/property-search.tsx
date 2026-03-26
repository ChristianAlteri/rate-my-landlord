"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Search, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PropertySearchProps {
  /** Server-provided search string (e.g. from URL) */
  defaultQuery?: string
  variant?: "hero" | "page"
}

export function PropertySearch({ defaultQuery = "", variant = "page" }: PropertySearchProps) {
  const [query, setQuery] = useState(defaultQuery)
  const router = useRouter()

  useEffect(() => {
    setQuery(defaultQuery)
  }, [defaultQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/properties?search=${encodeURIComponent(query.trim())}`)
    } else {
      router.push("/properties")
    }
  }

  const searchId = "property-search-query"

  return (
    <section
      aria-label="Search properties"
      className={cn(
        "mx-auto max-w-3xl px-4",
        variant === "hero" && "relative z-10 -mt-8",
      )}
    >
      <form
        onSubmit={handleSearch}
        role="search"
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-lg sm:flex-row sm:items-end sm:gap-4 sm:p-6"
      >
        <div className="relative min-w-0 flex-1 space-y-2">
          <Label htmlFor={searchId} className="text-foreground">
            Search properties
          </Label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              id={searchId}
              type="search"
              name="q"
              autoComplete="off"
              enterKeyHint="search"
              placeholder="Street, postcode, or landlord name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 min-h-12 pl-10 text-base"
            />
          </div>
        </div>
        <Button type="submit" size="lg" className="h-12 min-h-12 shrink-0 px-8">
          <Search className="h-5 w-5" aria-hidden />
          Search
        </Button>
      </form>
    </section>
  )
}
