import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function usePaymentsAdmin(residentialCluster?: string, isSuperAdmin: boolean = false) {
  return useQuery({
    queryKey: ['payments-admin', residentialCluster, isSuperAdmin],
    queryFn: async () => {
      let query = supabase
        .from('payments')
        .select('*, profiles(first_name, last_name, house_number, residential_cluster)')

      if (isSuperAdmin) {
        // Superadmin fetches all
      } else if (residentialCluster) {
        // Intelligent filtering as in the original code
        const clusterKeyword = residentialCluster.replace(/Conjunto\s+\d+\s+/i, '').trim()
        query = query.ilike('profiles.residential_cluster', `%${clusterKeyword}%`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
  })
}

export function useValidatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ paymentId, status }: { paymentId: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('payments')
        .update({ status })
        .eq('id', paymentId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments-admin'] })
    },
  })
}
