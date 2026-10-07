import { useEffect, useRef } from 'react'
import { ContactSection } from '../components/ContactSection'
import { FeaturesSection } from '../components/FeaturesSection'
import { HeroSection } from '../components/HeroSection'
import { MarketingFooter } from '../components/MarketingFooter'
import { MarketingNavbar } from '../components/MarketingNavbar'
import { SecuritySection } from '../components/SecuritySection'
import { StepsSection } from '../components/StepsSection'

export function LandingPage() {
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const revealItems =
      mainRef.current?.querySelectorAll<HTMLElement>('[data-reveal]')
    if (!revealItems?.length) return

    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.14, rootMargin: '0px 0px -36px 0px' },
    )

    revealItems.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <MarketingNavbar />
      <main ref={mainRef}>
        <HeroSection />
        <FeaturesSection />
        <SecuritySection />
        <StepsSection />
        <ContactSection />
      </main>
      <MarketingFooter />
    </>
  )
}
