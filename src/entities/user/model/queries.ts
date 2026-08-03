import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys, type UUID } from '@/shared/api'

import { userApi } from '../api/user-api'

/**
 * Invites a login. On success the employee roster is refreshed, because
 * passing `employee` fills in that row's `user` link.
 */
export function useInviteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.invite,
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: queryKeys.employees.all(),
      }),
  })
}

/** Nothing to invalidate: a reset changes no field the app displays. */
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: UUID; password?: string }) =>
      userApi.resetPassword(id, password),
  })
}

export function useChangeOwnPassword() {
  return useMutation({ mutationFn: userApi.changeOwnPassword })
}
