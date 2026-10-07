export interface AuthUser {
  id: string
  name?: string
  email: string
}

export interface SignupRequest {
  name: string
  email: string
  password: string
}

export interface SigninRequest {
  email: string
  password: string
}

export type AuthResponse = AuthUser

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
  requestId?: string
}
