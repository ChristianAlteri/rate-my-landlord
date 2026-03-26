import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <Link href="/" className="text-xl font-bold text-foreground">
              RateMyLandlord<span className="text-primary">.</span>
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">
              Power to the tenants. Honest reviews for London.
            </p>
          </div>
          
          <nav className="flex gap-6 text-sm">
            <Link href="/properties" className="text-muted-foreground hover:text-foreground transition-colors">
              Properties
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </nav>
        </div>
        
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>Built for London renters. Anonymous reviews since 2024.</p>
        </div>
      </div>
    </footer>
  )
}
