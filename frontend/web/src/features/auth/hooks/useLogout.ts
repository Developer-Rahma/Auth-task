import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '../api/auth.service'
import { authQueryKeys } from './authQueryKeys'

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: async () => {
      await queryClient.removeQueries({ queryKey: authQueryKeys.currentUser })
      navigate('/login', { replace: true })
    },
  })
}
