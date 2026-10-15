import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../shared/lib/supabase'

export function usePaymentsAdmin(residentialCluster?: string, isSuperAdmin: boolean = false) {
  return useQuery({
    queryKey: ['payments-admin', residentialCluster, isSuperAdmin],
    queryFn: async () => {
      let query = supabase
        .from('payments')
        .select('*, profiles(first_name, last_name, house_number, residential_cluster), payment_allocations(*, debts(concepto, tipo, monto_original, monto_pendiente))')

      if (isSuperAdmin) {
        // Superadmin fetches all
      } else if (residentialCluster) {
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
    mutationFn: async ({ paymentId, status, note }: { paymentId: string; status: 'approved' | 'rejected'; note?: string }) => {
      const { data, error } = await supabase.rpc('rpc_review_payment', {
        p_payment_id: paymentId,
        p_status: status,
        p_note: note || null
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments-admin'] })
    },
  })
}
