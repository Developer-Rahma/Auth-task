import { describe, expect, it } from 'vitest'
import { apiClient } from './apiClient'

describe('apiClient', () => {
  it('sends cookie credentials and the backend XSRF cookie/header pair', () => {
    expect(apiClient.defaults.withCredentials).toBe(true)
    expect(apiClient.defaults.withXSRFToken).toBe(true)
    expect(apiClient.defaults.xsrfCookieName).toBe('XSRF-TOKEN')
    expect(apiClient.defaults.xsrfHeaderName).toBe('X-XSRF-TOKEN')
  })
})
