"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Home, AlertCircle } from "lucide-react"
import { isMockDataEnabled } from "@/lib/data-mode"
import { pocSubmitProperty } from "@/app/actions/poc-data"

interface AddPropertyFormProps {
  defaultAddress?: string
  defaultPostcode?: string
  trigger?: React.ReactNode
}

const MANAGEMENT_OPTIONS = [
  { value: "Private Owner", label: "Private Owner" },
  { value: "Letting Agency", label: "Letting Agency" },
  { value: "Housing Association", label: "Housing Association" },
  { value: "Council", label: "Council" },
  { value: "Unknown", label: "Unknown" },
]

export function AddPropertyForm({ defaultAddress = "", defaultPostcode = "", trigger }: AddPropertyFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [address, setAddress] = useState(defaultAddress)
  const [postcode, setPostcode] = useState(defaultPostcode)
  const [managedBy, setManagedBy] = useState("")
  const [agencyName, setAgencyName] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const normalizedPostcode = postcode.trim().toUpperCase().replace(/\s+/g, " ")

    let landlordName = managedBy
    if (managedBy === "Letting Agency" && agencyName.trim()) {
      landlordName = `Managed by ${agencyName.trim()}`
    }

    if (isMockDataEnabled()) {
      const result = await pocSubmitProperty({
        address: address.trim(),
        postcode: normalizedPostcode,
        landlord_name: landlordName || null,
      })
      setIsSubmitting(false)

      if (!result.ok) {
        if ("existingId" in result && result.existingId) {
          setError("This property already exists! Redirecting you there...")
          setTimeout(() => {
            setOpen(false)
            router.push(`/properties/${result.existingId}`)
          }, 1200)
          return
        }
        setError(result.error === "POC mode is off." ? result.error : "Could not add property.")
        return
      }

      setOpen(false)
      router.push(`/properties/${result.id}`)
      router.refresh()
      return
    }

    const supabase = createClient()

    const { data: existing } = await supabase
      .from("properties")
      .select("id")
      .ilike("address", address.trim())
      .ilike("postcode", normalizedPostcode)
      .maybeSingle()

    if (existing) {
      setError("This property already exists! Redirecting you there...")
      setIsSubmitting(false)
      setTimeout(() => {
        setOpen(false)
        router.push(`/properties/${existing.id}`)
      }, 1500)
      return
    }

    const { data, error: insertError } = await supabase
      .from("properties")
      .insert({
        address: address.trim(),
        postcode: normalizedPostcode,
        landlord_name: landlordName || null,
      })
      .select("id")
      .single()

    setIsSubmitting(false)

    if (insertError) {
      if (insertError.code === "23505") {
        setError("This property already exists in the database.")
      } else {
        setError(`Failed to add property: ${insertError.message}`)
      }
      return
    }

    setOpen(false)
    router.push(`/properties/${data.id}`)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Property
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Add a New Property
          </DialogTitle>
          <DialogDescription>
            Can&apos;t find your property? Add it here so you and others can leave reviews.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              name="address"
              autoComplete="street-address"
              placeholder="e.g., 42 Victoria Road"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postcode">Postcode *</Label>
            <Input
              id="postcode"
              name="postcode"
              autoComplete="postal-code"
              placeholder="e.g., E8 3QQ"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="managed-by">Managed by</Label>
            <Select value={managedBy} onValueChange={setManagedBy}>
              <SelectTrigger id="managed-by">
                <SelectValue placeholder="Select who manages the property" />
              </SelectTrigger>
              <SelectContent>
                {MANAGEMENT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {managedBy === "Letting Agency" && (
            <div className="space-y-2">
              <Label htmlFor="agency-name">Agency Name (optional)</Label>
              <Input
                id="agency-name"
                placeholder="e.g., Foxtons, OpenRent"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Property"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
