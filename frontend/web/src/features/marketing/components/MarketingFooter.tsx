import { Brand } from '../../../shared/components/Brand'
import { Link } from 'react-router-dom'

const COPYRIGHT_YEAR = new Date().getFullYear()

export function MarketingFooter() {
  return (
    <footer className="site-footer">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          <Brand />
          <p className="mt-4 max-w-sm text-sm leading-6">
            Thoughtful access for the people building what comes next.
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="footer-links grid grid-cols-2 gap-4"
        >
          <a href="#features">Features</a>
          <a href="#security">Security</a>
          <a href="#contact">Contact</a>
          <Link to="/login">Sign in</Link>
          <Link to="/signup">Create an account</Link>
        </nav>
      </div>
      <div className="footer-bottom mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <span>© {COPYRIGHT_YEAR} Aster. All rights reserved.</span>
        <span>Designed for clarity. Built with care.</span>
      </div>
    </footer>
  )
}
