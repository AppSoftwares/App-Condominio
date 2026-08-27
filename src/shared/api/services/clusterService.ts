import { supabase } from '../../lib/supabase'

export interface ClusterInfo {
  cluster_name: string
  bank_name: string
  bank_account: string
  rif: string
  phone: string
  zelle_email: string
}

export const clusterService = {
  async getInfo(clusterName: string): Promise<ClusterInfo | null> {
    const { data, error } = await supabase
      .from('residential_clusters_info')
      .select('*')
      .eq('cluster_name', clusterName)
      .maybeSingle()

    if (error) {
      console.error('Error fetching cluster info:', error)
      return null
    }
    return data
  },

  async getAll(): Promise<ClusterInfo[]> {
    const { data, error } = await supabase
      .from('residential_clusters_info')
      .select('*')

    if (error) {
      console.error('Error fetching all clusters info:', error)
      return []
    }
    return data || []
  }
}
