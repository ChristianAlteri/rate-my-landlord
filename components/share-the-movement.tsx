"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, MessageCircle, Share2, Users } from "lucide-react"

const SHARE_LINE =
  "Honest landlord reviews for renters — no account needed. Together we're stronger than bad landlords."

export function ShareTheMovement() {
  const [origin, setOrigin] = useState("")
  const [status, setStatus] = useState<"idle" | "copied">("idle")

  useEffect(() => {
    setOrigin(typeof window !== "undefined" ? window.location.origin : "")
  }, [])

  const url = origin ? `${origin}/` : ""

  const copyLink = useCallback(async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setStatus("copied")
      setTimeout(() => setStatus("idle"), 2500)
    } catch {
      setStatus("idle")
    }
  }, [url])

  const nativeShare = useCallback(async () => {
    if (!url) return
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "RateMyLandlord — power to renters",
          text: SHARE_LINE,
          url,
        })
      } catch {
        /* user cancelled or share failed */
      }
    } else {
      await copyLink()
    }
  }, [url, copyLink])

  const openWhatsApp = useCallback(() => {
    if (!url) return
    const q = encodeURIComponent(`${SHARE_LINE}\n\n${url}`)
    window.open(`https://wa.me/?text=${q}`, "_blank", "noopener,noreferrer")
  }, [url])

  return (
    <section
      aria-labelledby="share-movement-heading"
      className="border-y border-primary/15 bg-linear-to-b from-primary/5 to-muted/30 py-16"
    >
      <div className="mx-auto max-w-3xl px-4 text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3 text-primary">
          <Users className="h-8 w-8" aria-hidden />
        </div>
        <h2
          id="share-movement-heading"
          className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          Together we&apos;re stronger
        </h2>
        <p className="mt-3 text-pretty text-base text-muted-foreground sm:text-lg">
          Every review helps the next renter walk in with eyes open. Send this to a mate who&apos;s flat-hunting,
          your house group chat, or anyone who&apos;s tired of landlord games —{" "}
          <span className="font-medium text-foreground">we grow the map one link at a time.</span>
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            type="button"
            size="lg"
            className="min-h-12 gap-2"
            onClick={nativeShare}
            disabled={!url}
          >
            <Share2 className="h-5 w-5" aria-hidden />
            Share with a friend
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="min-h-12 gap-2 border-primary/25 bg-background/80"
            onClick={copyLink}
            disabled={!url}
          >
            <Copy className="h-5 w-5" aria-hidden />
            {status === "copied" ? "Link copied" : "Copy link"}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="min-h-12 gap-2 border-primary/25 bg-background/80"
            onClick={openWhatsApp}
            disabled={!url}
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            WhatsApp
          </Button>
        </div>

        {status === "copied" && (
          <p className="mt-6 text-xs text-muted-foreground" role="status" aria-live="polite">
            Copied to clipboard — paste it anywhere.
          </p>
        )}
      </div>
    </section>
  )
}
