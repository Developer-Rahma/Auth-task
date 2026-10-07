import { ArrowRight, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'

const navigation = [
  { label: 'Features', href: '#features' },
  { label: 'Security', href: '#security' },
  { label: 'Contact', href: '#contact' },
]

export function MarketingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <div className="nav-inner relative mx-auto flex w-full max-w-6xl items-center justify-between px-6">
        <Brand />
        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="mobile-menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
        <nav
          aria-label="Main navigation"
          className={`nav-links ${menuOpen ? 'nav-links-open' : ''} flex-col gap-5 md:flex md:flex-row md:items-center`}
        >
          {navigation.map((item) => (
            <a href={item.href} key={item.href} onClick={closeMenu}>
              {item.label}
            </a>
          ))}
          <Link className="nav-signin" onClick={closeMenu} to="/login">
            Sign in
          </Link>
          <Link
            className="button button-primary color-white"
            onClick={closeMenu}
            to="/signup"
          >
            Get started <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </nav>
      </div>
    </header>
  )
}
