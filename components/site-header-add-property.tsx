"use client"

import { Plus } from "lucide-react"
import { AddPropertyForm } from "@/components/add-property-form"
import { Button } from "@/components/ui/button"

export function SiteHeaderAddProperty() {
  return (
    <AddPropertyForm
      trigger={
        <Button type="button" size="sm" className="gap-2 sm:h-10 sm:px-4">
          <Plus className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Add property</span>
          <span className="sm:hidden">Add</span>
        </Button>
      }
    />
  )
}
