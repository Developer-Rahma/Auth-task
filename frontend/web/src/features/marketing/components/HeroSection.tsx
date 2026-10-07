import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-inner mx-auto flex w-full max-w-6xl items-center px-6">
        <div className="hero-copy-group max-w-2xl">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            A more thoughtful way to sign in
          </span>
          <h1 className="hero-title">
            Your work,
            <br />
            <span className="hero-title-accent">beautifully secured.</span>
          </h1>
          <p className="hero-copy">
            A modern access experience that brings together calm design,
            dependable security, and a foundation ready to grow with you.
          </p>
          <div className="hero-actions flex flex-wrap gap-3">
            <Link className="button button-light" to="/signup">
              Create your account <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link className="button button-outline" to="/login">
              Sign in
            </Link>
          </div>
          <p className="hero-note">Simple by nature. Thoughtful by design.</p>
        </div>
        <div aria-hidden="true" className="hero-visual">
          <span className="orbit" />
          <span className="orbit orbit-two" />
          <span className="security-orb">
            <ShieldCheck size={72} strokeWidth={1.25} />
          </span>
          <span className="orbit-star orbit-star-one">
            <Sparkles size={18} />
          </span>
          <span className="orbit-star orbit-star-two">
            <UserRound size={18} />
          </span>
        </div>
      </div>
    </section>
  )
}
