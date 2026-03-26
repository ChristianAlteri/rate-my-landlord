import { Search, UserCircle, MessageSquare, Shield } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Find Your Property",
    description: "Search by address, postcode, or landlord name to find the property you want to review.",
  },
  {
    icon: UserCircle,
    title: "Choose a Username",
    description: "Pick any username you like. No email required. No account to create. Simple.",
  },
  {
    icon: MessageSquare,
    title: "Share Your Experience",
    description: "Rate your landlord and write an honest review about your rental experience.",
  },
  {
    icon: Shield,
    title: "Stay Protected",
    description: "Your review helps other tenants make informed decisions. Power to the people.",
  },
]

export function HowItWorks() {
  return (
    <section className="bg-muted/50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="text-muted-foreground">
            Leave a review in under 2 minutes. No sign up required.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <step.icon className="h-8 w-8" />
              </div>
              {index < steps.length - 1 && (
                <div className="absolute left-[calc(50%+40px)] top-8 hidden h-0.5 w-[calc(100%-80px)] bg-border lg:block" />
              )}
              <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
