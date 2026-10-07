import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../api/auth.service'
import type { AuthUser } from '../types/auth.types'
import { authQueryKeys } from './authQueryKeys'

export function useRefreshSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.refreshSession,
    onSuccess: (user) => {
      queryClient.setQueryData<AuthUser>(authQueryKeys.currentUser, user)
    },
  })
}
