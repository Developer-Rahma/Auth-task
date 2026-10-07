import { AxiosHeaders, type AxiosResponse } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { API_ENDPOINTS } from '../config/apiEndpoints'
import { apiClient } from '../../../shared/lib/apiClient'
import { authService } from './auth.service'
import type { AuthUser } from '../types/auth.types'

vi.mock('../../../shared/lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

function axiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() },
  }
}

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('keeps the backend auth paths centralized in config', () => {
    expect(API_ENDPOINTS.auth).toEqual({
      signup: '/api/auth/signup',
      signin: '/api/auth/signin',
      currentUser: '/api/auth/me',
      refreshSession: '/api/auth/refresh',
      logout: '/api/auth/logout',
    })
  })

  it('sends signup data to the signup endpoint', async () => {
    const user: AuthUser = {
      id: 'user-1',
      name: 'Avery Morgan',
      email: 'avery@example.com',
    }
    vi.mocked(apiClient.post).mockResolvedValueOnce(axiosResponse(user))

    await expect(
      authService.signup({
        name: user.name ?? '',
        email: user.email,
        password: 'SecurePass1!',
      }),
    ).resolves.toEqual(user)
    expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.auth.signup, {
      name: user.name,
      email: user.email,
      password: 'SecurePass1!',
    })
  })

  it('uses the cookie-backed signin, profile, refresh, and logout endpoints', async () => {
    const user: AuthUser = { id: 'user-1', email: 'avery@example.com' }
    vi.mocked(apiClient.post).mockResolvedValue(axiosResponse(user))
    vi.mocked(apiClient.get).mockResolvedValue(axiosResponse(user))

    await expect(
      authService.signin({ email: user.email, password: 'SecurePass1!' }),
    ).resolves.toEqual(user)
    await expect(authService.getCurrentUser()).resolves.toEqual(user)
    await expect(authService.refreshSession()).resolves.toEqual(user)
    await expect(authService.logout()).resolves.toBeUndefined()

    expect(apiClient.post).toHaveBeenNthCalledWith(1, API_ENDPOINTS.auth.signin, {
      email: user.email,
      password: 'SecurePass1!',
    })
    expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.auth.currentUser)
    expect(apiClient.post).toHaveBeenNthCalledWith(
      2,
      API_ENDPOINTS.auth.refreshSession,
    )
    expect(apiClient.post).toHaveBeenNthCalledWith(3, API_ENDPOINTS.auth.logout)
  })
})
