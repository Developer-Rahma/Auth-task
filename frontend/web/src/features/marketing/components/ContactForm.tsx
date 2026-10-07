import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Check } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  contactSchema,
  type ContactValues,
} from '../../auth/schemas/auth.schema'

export function ContactForm() {
  const [contactSent, setContactSent] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '' },
  })

  const submitContact = async (_values: ContactValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 650))
    setContactSent(true)
    reset()
  }

  return (
    <div className="contact-form-side p-8 sm:p-10">
      {contactSent ? (
        <div className="form-success mb-5" role="status">
          <Check aria-hidden="true" className="mt-0.5 shrink-0" size={19} />
          <span>
            <strong>Thanks for reaching out.</strong>
            <br />
            We’ll get back to you soon.
          </span>
        </div>
      ) : null}
      <form className="contact-form" noValidate onSubmit={handleSubmit(submitContact)}>
        <div className="form-field">
          <label className="form-label" htmlFor="contact-name">
            Name
          </label>
          <input
            {...register('name')}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            className="form-control"
            id="contact-name"
            placeholder="Your name"
          />
          {errors.name ? (
            <span className="field-error" id="contact-name-error" role="alert">
              {errors.name.message}
            </span>
          ) : null}
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="contact-email">
            Email
          </label>
          <input
            {...register('email')}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className="form-control"
            id="contact-email"
            placeholder="you@example.com"
            type="email"
          />
          {errors.email ? (
            <span className="field-error" id="contact-email-error" role="alert">
              {errors.email.message}
            </span>
          ) : null}
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="contact-message">
            Message
          </label>
          <textarea
            {...register('message')}
            aria-describedby={errors.message ? 'contact-message-error' : undefined}
            aria-invalid={Boolean(errors.message)}
            className="form-control"
            id="contact-message"
            placeholder="How can we help?"
          />
          {errors.message ? (
            <span className="field-error" id="contact-message-error" role="alert">
              {errors.message.message}
            </span>
          ) : null}
        </div>
        <button
          className="button button-primary mt-1 justify-self-start"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Sending…' : 'Send message'}
          {!isSubmitting ? <ArrowRight aria-hidden="true" size={16} /> : null}
        </button>
      </form>
    </div>
  )
}
