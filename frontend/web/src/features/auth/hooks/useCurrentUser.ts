import { useQuery } from '@tanstack/react-query'
import { authService } from '../api/auth.service'
import { isUnauthorizedApiError } from '../../../shared/lib/apiError'
import { authQueryKeys } from './authQueryKeys'

async function getCurrentUserWithRefresh() {
  try {
    return await authService.getCurrentUser()
  } catch (error) {
    if (!isUnauthorizedApiError(error)) {
      throw error
    }

    await authService.refreshSession()
    return authService.getCurrentUser()
  }
}

export function useCurrentUser() {
  const query = useQuery({
    queryKey: authQueryKeys.currentUser,
    queryFn: getCurrentUserWithRefresh,
    retry: false,
  })

  return {
    user: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
