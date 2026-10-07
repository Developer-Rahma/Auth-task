import {
  ArrowUpRight,
  Bell,
  ChevronRight,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { getApiErrorMessage } from '../../../shared/lib/apiError'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useLogout } from '../hooks/useLogout'
import { summaryCards } from '../utils/summaryCards'


export function ApplicationPage() {
  const { user } = useCurrentUser()
  const logout = useLogout()
  const displayName =
    user?.name ?? user?.email.split('@')[0] ?? 'Aster member'
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <main className="dashboard-page">
      <div className="dashboard-shell flex min-h-screen">
        <aside aria-label="Application sidebar" className="dashboard-sidebar flex flex-col p-5">
          <Brand />
          <nav aria-label="Dashboard navigation" className="dashboard-sidebar-nav mt-12 grid gap-2">
            <a
              aria-current="page"
              className="flex items-center gap-3 rounded-xl bg-[#f1edf8] px-3 py-3 text-sm font-semibold text-[#39225e]"
              href="#overview"
            >
              <LayoutDashboard aria-hidden="true" size={18} />
              Overview
            </a>
            <a className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#706d83] hover:bg-[#f7f5fa]" href="#account">
              <Settings aria-hidden="true" size={18} />
              Account settings
            </a>
            <a className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#706d83] hover:bg-[#f7f5fa]" href="#help">
              <CircleHelp aria-hidden="true" size={18} />
              Help & support
            </a>
          </nav>
          <div className="mt-auto hidden rounded-2xl bg-[#f5f3fa] p-4 md:block">
            <ShieldCheck aria-hidden="true" className="text-[#4b3472]" size={20} />
            <p className="mt-3 text-sm font-semibold text-[#211044]">Your space is protected</p>
            <p className="mt-1 text-xs leading-5 text-[#706d83]">
              Security is built into every step of your Aster experience.
            </p>
          </div>
        </aside>

        <div className="dashboard-main flex min-h-screen flex-1 flex-col">
          <header className="dashboard-topbar flex items-center justify-between px-8">
            <span className="text-sm font-medium text-[#706d83]">Workspace / Overview</span>
            <div className="flex items-center gap-3">
              <div className="avatar" aria-label="Avery Morgan">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-[#211044]">{displayName}</p>
                <p className="text-xs text-[#706d83]">{user?.email}</p>
              </div>
              <button
                aria-label="Log out"
                className="ml-2 grid h-10 w-10 place-items-center rounded-xl text-[#706d83] hover:bg-[#f5f3fa] hover:text-[#211044] disabled:opacity-50"
                disabled={logout.isPending}
                onClick={() => logout.mutate()}
                title="Log out"
                type="button"
              >
                <LogOut aria-hidden="true" size={18} />
              </button>
            </div>
          </header>

          <section className="dashboard-content mx-auto w-full max-w-6xl flex-1 px-8 py-10" id="overview">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="mb-2 text-sm font-semibold text-[#684c96]">Your dashboard</p>
                <h1 className="dashboard-welcome">Welcome to the application.</h1>
                <p className="mt-3 text-[#706d83]">
                  Your secure workspace is ready whenever you are.
                </p>
              </div>
              <Link className="button button-primary" to="/">
                Explore home <ArrowUpRight aria-hidden="true" size={16} />
              </Link>
            </div>

            {logout.isError ? (
              <p className="mt-5 text-sm text-[#bd354c]" role="alert">
                {getApiErrorMessage(logout.error)}
              </p>
            ) : null}

            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {summaryCards.map(({ label, value, icon: Icon }) => (
                <article className="dashboard-stat" key={label}>
                  <div className="flex items-center justify-between">
                    <span className="dashboard-stat-label">{label}</span>
                    <Icon aria-hidden="true" className="text-[#684c96]" size={19} />
                  </div>
                  <p className="dashboard-stat-value">{value}</p>
                </article>
              ))}
            </div>

            <section aria-labelledby="next-title" className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight text-[#211044]" id="next-title">
                  Make yourself at home
                </h2>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#817d90]">Getting started</span>
              </div>
              <div className="dashboard-empty flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-[#211044]">Your next steps will appear here.</p>
                  <p className="mt-1 text-sm">
                    This dashboard is a preview of your protected application area.
                  </p>
                </div>
                <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#533580]" to="/">
                  Back to Aster <ChevronRight aria-hidden="true" size={16} />
                </Link>
              </div>
            </section>
          </section>
        </div>
      </div>
    </main>
  )
}
