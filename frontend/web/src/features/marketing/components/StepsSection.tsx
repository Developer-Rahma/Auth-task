const steps = [
  {
    title: 'Create your account',
    description: 'Set up your profile with a few simple details.',
  },
  {
    title: 'Sign in securely',
    description: 'Return to your space with a clear, dependable sign-in.',
  },
  {
    title: 'Get to work',
    description: 'Arrive at a welcoming dashboard, ready for what is next.',
  },
]

export function StepsSection() {
  return (
    <section aria-labelledby="steps-title" className="section bg-[#fbfaff]">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="section-heading" data-reveal>
          <span className="section-kicker">A clear path forward</span>
          <h2 className="section-title" id="steps-title">
            Up and running in three steps.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <article className="step-card" data-reveal key={step.title}>
              <span className="step-number">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
