import { Code2, Gauge, Layers3, ShieldCheck } from 'lucide-react'

const features = [
  {
    title: 'Secure by design',
    description:
      'Build confidence with carefully considered password rules and protected access patterns.',
    icon: ShieldCheck,
  },
  {
    title: 'Fast and reliable',
    description:
      'A responsive experience that stays clear and comfortable on every screen.',
    icon: Gauge,
  },
  {
    title: 'Developer friendly',
    description:
      'A modular foundation that is easy to understand, maintain, and extend.',
    icon: Code2,
  },
  {
    title: 'Ready to grow',
    description:
      'A flexible starting point designed to evolve as your product needs change.',
    icon: Layers3,
  },
]

export function FeaturesSection() {
  return (
    <section
      aria-labelledby="features-title"
      className="section bg-[#fbfaff]"
      id="features"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="section-heading" data-reveal>
          <span className="section-kicker">Made to feel effortless</span>
          <h2 className="section-title" id="features-title">
            A stronger foundation for every sign-in.
          </h2>
          <p className="section-copy">
            The essential parts of account access, brought together in one clear
            and considered experience.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ title, description, icon: Icon }) => (
            <article className="feature-card" data-reveal key={title}>
              <span className="feature-icon">
                <Icon aria-hidden="true" size={22} />
              </span>
              <h3 className="feature-title">{title}</h3>
              <p className="feature-copy">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
