"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, MessageCircle, Share2, Users } from "lucide-react"

type ShareListingProps = {
  /** Full URL to this property page */
  shareUrl: string
  /** Short address line for copy (e.g. street + postcode) */
  addressLabel: string
}

export function ShareListing({ shareUrl, addressLabel }: ShareListingProps) {
  const [status, setStatus] = useState<"idle" | "copied">("idle")

  const shareLine = `Honest renter reviews for ${addressLabel} on RateMyLandlord — no account needed. Together we're stronger than bad landlords.`

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setStatus("copied")
      setTimeout(() => setStatus("idle"), 2500)
    } catch {
      setStatus("idle")
    }
  }, [shareUrl])

  const nativeShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `RateMyLandlord — ${addressLabel}`,
          text: shareLine,
          url: shareUrl,
        })
      } catch {
        /* dismissed */
      }
    } else {
      await copyLink()
    }
  }, [shareUrl, shareLine, addressLabel, copyLink])

  const openWhatsApp = useCallback(() => {
    const q = encodeURIComponent(`${shareLine}\n\n${shareUrl}`)
    window.open(`https://wa.me/?text=${q}`, "_blank", "noopener,noreferrer")
  }, [shareUrl, shareLine])

  return (
    <section
      aria-labelledby="share-listing-heading"
      className="rounded-xl border border-primary/20 bg-muted/40 px-4 py-5 sm:px-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex gap-3 sm:min-w-0 sm:flex-1">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 text-left">
            <h2
              id="share-listing-heading"
              className="text-base font-semibold text-foreground sm:text-lg"
            >
              Know someone looking here?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pass this listing along — together we&apos;re stronger than one-sided agent blurbs.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Button
            type="button"
            size="sm"
            className="min-h-10 gap-1.5"
            onClick={nativeShare}
          >
            <Share2 className="h-4 w-4" aria-hidden />
            Share
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="min-h-10 gap-1.5 border-primary/25"
            onClick={copyLink}
          >
            <Copy className="h-4 w-4" aria-hidden />
            {status === "copied" ? "Copied" : "Copy link"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="min-h-10 gap-1.5 border-primary/25"
            onClick={openWhatsApp}
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            WhatsApp
          </Button>
        </div>
      </div>
      {status === "copied" && (
        <p className="mt-3 text-xs text-muted-foreground sm:text-right" role="status" aria-live="polite">
          Link copied — send it wherever renters gather.
        </p>
      )}
    </section>
  )
}
