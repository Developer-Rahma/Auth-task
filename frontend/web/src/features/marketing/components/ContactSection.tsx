import { ContactForm } from './ContactForm'

export function ContactSection() {
  return (
    <section
      aria-labelledby="contact-title"
      className="contact-section section"
      id="contact"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <div
          className="contact-panel grid md:grid-cols-[0.85fr_1.15fr]"
          data-reveal
        >
          <div className="contact-aside flex flex-col justify-between p-8 sm:p-10">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                We would love to hear from you
              </span>
              <h3 id="contact-title">Let’s start a conversation.</h3>
              <p>
                Have a question or want to learn more? Send us a note and we’ll
                be glad to help.
              </p>
            </div>
            <p className="mt-12 text-sm">
              Aster · A more considered access experience
            </p>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
