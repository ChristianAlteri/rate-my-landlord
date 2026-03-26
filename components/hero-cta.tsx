"use client"

import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { AddPropertyForm } from "@/components/add-property-form"
import { Button } from "@/components/ui/button"

export function HeroCta() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
      <Button asChild size="lg" className="h-12 min-h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto sm:min-w-[200px]">
        <Link href="/properties">
          <Search className="h-5 w-5" aria-hidden />
          Find a property
        </Link>
      </Button>
      <AddPropertyForm
        trigger={
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-12 min-h-12 w-full border-primary-foreground/35 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto sm:min-w-[200px]"
          >
            <Plus className="h-5 w-5" aria-hidden />
            Add a property
          </Button>
        }
      />
    </div>
  )
}
