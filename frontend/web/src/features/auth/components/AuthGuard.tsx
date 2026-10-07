import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isUnauthorizedApiError } from '../../../shared/lib/apiError'
import { useCurrentUser } from '../hooks/useCurrentUser'

type AuthGuardProps = {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation()
  const { user, isLoading, isError, error, refetch } = useCurrentUser()

  if (isLoading) {
    return (
      <main
        aria-busy="true"
        aria-live="polite"
        className="grid min-h-screen place-items-center bg-[#f7f6fb] text-[#706d83]"
      >
        Checking your session…
      </main>
    )
  }

  if (isError && isUnauthorizedApiError(error)) {
    return (
      <Navigate
        replace
        state={{ from: location }}
        to="/login"
      />
    )
  }

  if (isError && !isUnauthorizedApiError(error)) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f6fb] px-6">
        <div className="max-w-md rounded-2xl border border-[#e7e5ef] bg-white p-7 text-center shadow-sm">
          <p className="font-semibold text-[#211044]" role="alert">
            {error instanceof Error
              ? 'We could not verify your session.'
              : 'Something went wrong. Please try again later.'}
          </p>
          <button
            className="button button-primary mt-5"
            onClick={() => void refetch()}
            type="button"
          >
            Try again
          </button>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <Navigate
        replace
        state={{ from: location }}
        to="/login"
      />
    )
  }

  return children
}
