import { Shield } from "lucide-react"
import { HeroCta } from "@/components/hero-cta"

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-foreground text-primary-foreground"
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTEgMGExIDEgMCAxIDAgMiAwIDEgMSAwIDEgMCAtMiAwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')] opacity-30" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-2 text-sm font-medium">
            <Shield className="h-4 w-4 shrink-0" aria-hidden />
            Anonymous reviews — no account required
          </p>

          <h1
            id="hero-heading"
            className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Power to the
            <span className="block text-primary">Tenants</span>
          </h1>

          <p className="mb-10 max-w-2xl text-pretty text-lg text-primary-foreground/90 sm:text-xl">
            Search an address, add it if it&apos;s missing, and leave an honest review in minutes.
          </p>

          <HeroCta />
          
          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-primary-foreground/20 pt-8 text-center sm:gap-16">
            <div>
              <div className="text-3xl font-bold text-primary sm:text-4xl">100%</div>
              <div className="text-sm text-primary-foreground/70">Anonymous</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary sm:text-4xl">Free</div>
              <div className="text-sm text-primary-foreground/70">Forever</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary sm:text-4xl">London</div>
              <div className="text-sm text-primary-foreground/70">Coverage</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
