import { apiClient } from '../../../shared/lib/apiClient'
import { API_ENDPOINTS } from '../config/apiEndpoints'
import type {
  AuthResponse,
  AuthUser,
  SigninRequest,
  SignupRequest,
} from '../types/auth.types'

export const authService = {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.signup,
      data,
    )
    return response.data
  },

  async signin(data: SigninRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.signin,
      data,
    )
    return response.data
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>(API_ENDPOINTS.auth.currentUser)
    return response.data
  },

  async refreshSession(): Promise<AuthUser> {
    const response = await apiClient.post<AuthUser>(
      API_ENDPOINTS.auth.refreshSession,
    )
    return response.data
  },

  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.logout)
  },
}
