import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { votingService, Voting } from '../services/votingService'

export function useVotings(clusterName?: string) {
  return useQuery({
    queryKey: ['votings', clusterName],
    queryFn: () => votingService.list(clusterName),
  })
}

export function useCreateVoting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (voting: Partial<Voting>) => votingService.create(voting),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['votings'] })
    },
  })
}

export function useDeleteVoting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => votingService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['votings'] })
    },
  })
}

export function useVotingResults(votingId: string) {
  return useQuery({
    queryKey: ['voting-results', votingId],
    queryFn: () => votingService.getResults(votingId),
    enabled: !!votingId,
  })
}
