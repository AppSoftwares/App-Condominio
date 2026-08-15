import { supabase } from '../lib/supabase'

export interface Voting {
  id: string
  title: string
  description: string
  amount_estimated: number
  end_date: string
  is_active: boolean
  cluster_name?: string
  created_at: string
}

export const votingService = {
  async list(clusterName?: string): Promise<Voting[]> {
    let query = supabase
      .from('internal_votings')
      .select('*')
      .order('created_at', { ascending: false })

    if (clusterName) {
      const cleanCluster = clusterName.replace(/Conjunto\s+\d+\s+/i, '').trim();
      query = query.or(`cluster_name.ilike.%${cleanCluster}%,cluster_name.is.null`)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async create(voting: Partial<Voting>) {
    const { data, error } = await supabase
      .from('internal_votings')
      .insert([voting])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async castVote(votingId: string, profileId: string, option: 'favor' | 'contra') {
    const { error } = await supabase
      .from('internal_votes')
      .upsert({
        voting_id: votingId,
        profile_id: profileId,
        option
      })

    if (error) throw error
  },

  async getResults(votingId: string) {
    const { data, error } = await supabase
      .from('internal_votes')
      .select('option')
      .eq('voting_id', votingId)

    if (error) throw error

    const results = { favor: 0, contra: 0 }
    data.forEach((v: any) => {
      if (v.option === 'favor') results.favor++
      else if (v.option === 'contra') results.contra++
    })
    return results
  },

  async delete(votingId: string) {
    const { error } = await supabase.from('internal_votings').delete().eq('id', votingId)
    if (error) throw error
  }
}
