import { LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'

type BrandProps = {
  className?: string
}

export function Brand({ className = '' }: BrandProps) {
  return (
    <Link aria-label="Aster home" className={`brand ${className}`} to="/">
      <span aria-hidden="true" className="brand-mark">
        <LockKeyhole size={18} strokeWidth={2.3} />
      </span>
      <span>Aster</span>
    </Link>
  )
}
