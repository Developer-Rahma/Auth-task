import axios from 'axios'
import type { ApiErrorResponse } from '../../features/auth/types/auth.types'

export const GENERIC_API_ERROR_MESSAGE =
  'Something went wrong. Please try again later.'

export function isUnauthorizedApiError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401
}

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_API_ERROR_MESSAGE
  }

  const apiError = error.response?.data?.error

  if (
    !apiError ||
    typeof apiError.code !== 'string' ||
    typeof apiError.message !== 'string'
  ) {
    return GENERIC_API_ERROR_MESSAGE
  }

  if (apiError.code === 'INVALID_CREDENTIALS') {
    return 'Invalid email or password.'
  }

  return apiError.message
}
