import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../api/auth.service'
import type { AuthUser, SignupRequest } from '../types/auth.types'
import { authQueryKeys } from './authQueryKeys'

export function useSignup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SignupRequest) => authService.signup(data),
    onSuccess: (user) => {
      queryClient.setQueryData<AuthUser>(authQueryKeys.currentUser, user)
    },
  })
}
