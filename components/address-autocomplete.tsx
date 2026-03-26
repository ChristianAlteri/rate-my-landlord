"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { Loader2, MapPin, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  isAddressSearchConfigured,
  resolvePlaceToAddress,
  searchAddressSuggestions,
  type AddressSuggestion,
} from "@/app/actions/address-search"
import { cn } from "@/lib/utils"

type AddressAutocompleteProps = {
  sessionToken: string
  address: string
  postcode: string
  onAddressChange: (v: string) => void
  onPostcodeChange: (v: string) => void
  /** Called when the user may submit (picked a suggestion, manual mode, or Places is off). */
  onVerificationChange: (verified: boolean) => void
}

export function AddressAutocomplete({
  sessionToken,
  address,
  postcode,
  onAddressChange,
  onPostcodeChange,
  onVerificationChange,
}: AddressAutocompleteProps) {
  const listId = useId()
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [manualMode, setManualMode] = useState(false)
  const [search, setSearch] = useState("")
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [picked, setPicked] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    isAddressSearchConfigured().then(setConfigured)
  }, [])

  useEffect(() => {
    if (configured === null) {
      onVerificationChange(false)
      return
    }
    if (!configured) {
      onVerificationChange(true)
      return
    }
    onVerificationChange(picked || manualMode)
  }, [configured, picked, manualMode, onVerificationChange])

  useEffect(() => {
    if (picked || manualMode || !configured) return
    const q = search.trim()
    if (q.length < 3) {
      setSuggestions([])
      return
    }
    let cancelled = false
    const t = setTimeout(() => {
      setLoading(true)
      void searchAddressSuggestions(q, sessionToken).then((r) => {
        if (cancelled) return
        setLoading(false)
        if (r.ok) {
          setSuggestions(r.suggestions)
          setOpen(r.suggestions.length > 0)
        } else {
          setSuggestions([])
          setOpen(false)
        }
      })
    }, 350)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [search, sessionToken, picked, manualMode, configured])

  const selectSuggestion = useCallback(
    async (s: AddressSuggestion) => {
      setResolving(true)
      setOpen(false)
      const r = await resolvePlaceToAddress(s.placeId, sessionToken)
      setResolving(false)
      if (!r.ok) {
        setSuggestions([])
        return
      }
      onAddressChange(r.address)
      onPostcodeChange(r.postcode)
      setSearch("")
      setSuggestions([])
      setPicked(true)
    },
    [sessionToken, onAddressChange, onPostcodeChange],
  )

  const clearPick = () => {
    setPicked(false)
    onAddressChange("")
    onPostcodeChange("")
    setSearch("")
    setSuggestions([])
  }

  const enableManual = () => {
    setManualMode(true)
    setPicked(false)
    setSearch("")
    setSuggestions([])
    setOpen(false)
  }

  const disableManual = () => {
    setManualMode(false)
    onAddressChange("")
    onPostcodeChange("")
  }

  if (configured === null) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading address search…
        </div>
        <div className="h-20 animate-pulse rounded-md bg-muted" />
      </div>
    )
  }

  if (!configured || manualMode) {
    return (
      <div className="space-y-4">
        {configured && (
          <div className="flex items-start gap-2 rounded-md border border-border/80 bg-muted/30 p-3">
            <Checkbox
              id="manual-addr"
              checked={manualMode}
              onCheckedChange={(c) => (c ? enableManual() : disableManual())}
            />
            <label htmlFor="manual-addr" className="text-sm leading-snug">
              Enter address manually (easier to duplicate or mistype — use only if the list doesn&apos;t show your
              building)
            </label>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="addr-line-manual">Street address *</Label>
          <Input
            id="addr-line-manual"
            autoComplete="street-address"
            placeholder="e.g., 42 Victoria Road"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postcode-manual">Postcode *</Label>
          <Input
            id="postcode-manual"
            autoComplete="postal-code"
            placeholder="e.g., E8 3QQ"
            value={postcode}
            onChange={(e) => onPostcodeChange(e.target.value)}
            required
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-md border border-border/80 bg-muted/30 p-3">
        <Checkbox
          id="manual-addr-toggle"
          checked={manualMode}
          onCheckedChange={(c) => (c ? enableManual() : disableManual())}
        />
        <label htmlFor="manual-addr-toggle" className="text-sm leading-snug text-muted-foreground">
          I don&apos;t see my address — enter manually
        </label>
      </div>

      {picked ? (
        <div className="space-y-3 rounded-md border bg-card p-4">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium leading-snug">{address}</p>
              <p className="text-sm text-muted-foreground">{postcode}</p>
            </div>
            <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1" onClick={clearPick}>
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              Change
            </Button>
          </div>
        </div>
      ) : (
        <div ref={wrapRef} className="relative space-y-2">
          <Label htmlFor="addr-search">Search for your UK address *</Label>
          <div className="relative">
            <Input
              id="addr-search"
              autoComplete="off"
              placeholder="Start typing street name or postcode…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setOpen(true)
              }}
              onFocus={() => suggestions.length > 0 && setOpen(true)}
              onBlur={() => {
                setTimeout(() => setOpen(false), 180)
              }}
              aria-expanded={open}
              aria-controls={listId}
              aria-autocomplete="list"
              disabled={resolving}
            />
            {resolving && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
          {loading && !resolving && (
            <p className="text-xs text-muted-foreground">Searching…</p>
          )}
          {open && suggestions.length > 0 && (
            <ul
              id={listId}
              role="listbox"
              className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-sm shadow-md"
            >
              {suggestions.map((s) => (
                <li key={s.placeId} role="presentation">
                  <button
                    type="button"
                    role="option"
                    className={cn(
                      "flex w-full cursor-pointer rounded-sm px-2 py-2 text-left text-sm",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => void selectSuggestion(s)}
                  >
                    {s.description}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
