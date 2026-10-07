import { ArrowUpRight, Check, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'

type AuthShellProps = {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="auth-page">
      <div className="auth-layout mx-auto flex w-full max-w-6xl items-center justify-between gap-12 px-6 py-12">
        <Brand className="auth-brand" />
        <section aria-label="Aster authentication" className="auth-promo hidden md:block">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Your space, secured
          </span>
          <h2 className="auth-promo-title">A calmer way to access what matters.</h2>
          <p className="auth-promo-copy">
            Thoughtful protection, a clear experience, and room for everything
            you are building next.
          </p>
          <div className="auth-promo-points">
            <span className="auth-promo-point">
              <ShieldCheck aria-hidden="true" size={18} /> Security built into
              every step
            </span>
            <span className="auth-promo-point">
              <Check aria-hidden="true" size={18} /> A simple, focused sign-in
              experience
            </span>
          </div>
          <Link className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white" to="/">
            Explore Aster <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </section>
        <div className="w-full max-w-[480px]">{children}</div>
      </div>
    </main>
  )
}
