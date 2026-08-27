import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export function useProfiles(residentialCluster?: string, isSuperAdmin: boolean = false) {
  return useQuery({
    queryKey: ['profiles', residentialCluster, isSuperAdmin],
    queryFn: async () => {
      let query = supabase.from('profiles').select('*')
      if (!isSuperAdmin && residentialCluster) {
        query = query.eq('residential_cluster', residentialCluster)
      }
      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
  })
}

export function useApproveUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] })
    },
  })
}

export function useInviteResident() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      email: string;
      first_name: string;
      last_name: string;
      house_number: string;
      residential_cluster?: string;
      role?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('invite-resident2', { body: payload })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] })
    },
  })
}
