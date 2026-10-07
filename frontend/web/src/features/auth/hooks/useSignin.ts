import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../api/auth.service'
import type { AuthUser, SigninRequest } from '../types/auth.types'
import { authQueryKeys } from './authQueryKeys'

export function useSignin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SigninRequest) => authService.signin(data),
    onSuccess: (user) => {
      queryClient.setQueryData<AuthUser>(authQueryKeys.currentUser, user)
    },
  })
}
