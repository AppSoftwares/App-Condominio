import { supabase } from '../lib/supabase'

export interface PaymentPayload {
  monto_bs: number
  monto_usd: number
  referencia: string
  banco_origen: string
  evidencia_url: string
  description: string
  details: any
  idempotency_key?: string
}

export const paymentService = {
  async registerPayment(payload: PaymentPayload) {
    const { error } = await supabase.rpc('rpc_insert_payment', {
      monto_bs: payload.monto_bs,
      monto_usd: payload.monto_usd,
      referencia: payload.referencia,
      banco_origen: payload.banco_origen,
      evidencia_url: payload.evidencia_url,
      description: payload.description,
      details: payload.details,
      idempotency_key: payload.idempotency_key
    })

    if (error) throw error
  },

  async getPaymentsByCluster(clusterName: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*, profiles!inner(*)')
      .eq('profiles.residential_cluster', clusterName)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}
