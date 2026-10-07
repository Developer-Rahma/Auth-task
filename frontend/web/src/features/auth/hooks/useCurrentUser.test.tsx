// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { authService } from '../api/auth.service'
import type { AuthUser } from '../types/auth.types'
import { useCurrentUser } from './useCurrentUser'

vi.mock('../api/auth.service', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    refreshSession: vi.fn(),
  },
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  }
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('useCurrentUser', () => {
  it('refreshes once after an unauthorized profile request', async () => {
    const user: AuthUser = {
      id: 'user-1',
      name: 'Avery Morgan',
      email: 'avery@example.com',
    }
    const unauthorized = Object.assign(new Error('Unauthorized'), {
      isAxiosError: true,
      response: { status: 401 },
    })
    vi.mocked(authService.getCurrentUser)
      .mockRejectedValueOnce(unauthorized)
      .mockResolvedValueOnce(user)
    vi.mocked(authService.refreshSession).mockResolvedValue({
      id: user.id,
      email: user.email,
    })

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => expect(result.current.user).toEqual(user))
    expect(authService.getCurrentUser).toHaveBeenCalledTimes(2)
    expect(authService.refreshSession).toHaveBeenCalledTimes(1)
  })

  it('does not refresh on non-401 errors and disables query retries', async () => {
    vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('offline'))
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(authService.getCurrentUser).toHaveBeenCalledTimes(1)
    expect(authService.refreshSession).not.toHaveBeenCalled()
  })
})
