import { Check, Fingerprint, LockKeyhole } from 'lucide-react'

const principles = [
  {
    title: 'Secure password handling',
    description: 'Clear requirements help people create stronger credentials.',
    icon: LockKeyhole,
  },
  {
    title: 'Protected access',
    description:
      'A focused entry point keeps the application experience intentional.',
    icon: Fingerprint,
  },
  {
    title: 'Validated input',
    description: 'Helpful feedback catches common mistakes before submission.',
    icon: Check,
  },
]

export function SecuritySection() {
  return (
    <section
      aria-labelledby="security-title"
      className="security-section section"
      id="security"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="section-heading" data-reveal>
          <span className="section-kicker">Confidence, built in</span>
          <h2 className="section-title" id="security-title">
            Security is part of the experience.
          </h2>
          <p className="section-copy">
            Access should feel simple for people and thoughtfully engineered
            behind the scenes. Every detail starts with that balance.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {principles.map(({ title, description, icon: Icon }) => (
            <article className="principle-card" data-reveal key={title}>
              <span className="principle-icon">
                <Icon aria-hidden="true" size={20} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
