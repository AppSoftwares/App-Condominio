import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MdOutlineHowToVote,
  MdOutlineHistory,
  MdOutlineEventNote,
  MdOutlineDownload
} from 'react-icons/md'
import { useAuthStore } from '../../../app/store/useAuthStore'
import { supabase } from '../../../shared/lib/supabase'
import { votingService, Voting } from '../../../shared/api/services/votingService'
import { listAnnouncements, AnnouncementDTO } from '../../../shared/api/announcementsApi'

export const RequestsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [votings, setVotings] = useState<Voting[]>([])
  const [announcements, setAnnouncements] = useState<AnnouncementDTO[]>([])
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([])
  const [votedIds, setVotedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const [vRes, aRes, sRes, myVotesRes] = await Promise.allSettled([
          votingService.list(user?.residential_cluster),
          listAnnouncements(),
          supabase.from('security_alerts')
            .select('*')
            .gt('created_at', yesterday)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase.from('internal_votes')
            .select('voting_id')
            .eq('profile_id', user?.id)
        ])

        if (vRes.status === 'fulfilled') setVotings(vRes.value)
        if (aRes.status === 'fulfilled') setAnnouncements(aRes.value)
        if (sRes.status === 'fulfilled') setSecurityAlerts(sRes.value.data || [])

        if (myVotesRes.status === 'fulfilled' && myVotesRes.value.data) {
          setVotedIds(myVotesRes.value.data.map((v: any) => v.voting_id))
        }

      } catch (err) {
        console.error('Error cargando comunidad:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user?.id, user?.residential_cluster])

  const handleVote = async (votingId: string, opcion: 'favor' | 'contra') => {
    if (!user) return
    try {
      await votingService.castVote(votingId, user.id, opcion)
      setVotedIds(prev => [...prev, votingId])
      alert('¡Voto registrado con éxito!')
    } catch (err: any) {
      alert('No se pudo registrar el voto.')
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <main style={{ paddingLeft: '20px', paddingRight: '20px', width: '100%', maxWidth: '600px', boxSizing: 'border-box', paddingTop: '10px' }}>
        <section style={{ marginBottom: '30px' }}>
           <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: '32px', color: 'var(--primary-color)', margin: '0 0 10px 0' }}>Portal de Comunidad</h2>
           <p style={{ fontSize: '14px', color: 'var(--text-sub)', margin: 0 }}>Participe en las decisiones de nuestra comunidad.</p>
        </section>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
           <MdOutlineHowToVote size={24} style={{ color: '#785919' }} />
           <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Votaciones Activas</h3>
        </div>

        {securityAlerts.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#ba1a1a', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">warning</span> ALERTAS DE SEGURIDAD
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {securityAlerts.map(alert => (
                <div key={alert.id} style={{ backgroundColor: alert.severity === 'critical' ? 'rgba(186,26,26,0.05)' : 'var(--icon-bg)', border: `1px solid ${alert.severity === 'critical' ? '#ba1a1a' : 'var(--border-color)'}`, borderRadius: '16px', padding: '15px' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: alert.severity === 'critical' ? '#ba1a1a' : 'inherit' }}>{alert.title}</p>
                  <p style={{ margin: '5px 0 0', fontSize: '13px', color: 'var(--text-sub)' }}>{alert.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center' }}>Cargando...</p>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'rgba(186,26,26,0.05)', borderRadius: '16px', border: '1px solid rgba(186,26,26,0.2)' }}>
            <p style={{ color: '#ba1a1a', fontWeight: 600, margin: 0 }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: '10px', background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Reintentar
            </button>
          </div>
        ) : votings.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-sub)' }}>No hay votaciones activas en este momento.</p>
        ) : votings.map(voting => (
          <VotingCard
            key={voting.id}
            voting={voting}
            hasVoted={votedIds.includes(voting.id)}
            onVote={(opcion) => handleVote(voting.id, opcion)}
          />
        ))}

        <div style={historyCardStyle}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <MdOutlineHistory size={24} />
              <h4 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Historial</h4>
           </div>
           <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>Resultados de votaciones anteriores.</p>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 700, marginTop: '40px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Comunicados</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
           {announcements.length === 0 ? (
             <p style={{ textAlign: 'center', color: 'var(--text-sub)' }}>No hay comunicados oficiales publicados.</p>
           ) : announcements.map(ann => (
             <div key={ann.id} style={annCardStyle}>
                <div style={annIconStyle}>
                   <MdOutlineEventNote size={24} />
                </div>
                <div style={{ flex: 1 }}>
                   <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>{ann.titulo}</p>
                   <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-sub)' }}>{new Date(ann.fecha_creacion).toLocaleDateString()}</p>
                </div>
                <MdOutlineDownload size={20} style={{ color: 'var(--text-sub)' }} />
             </div>
           ))}
        </div>
      </main>
    </div>
  )
}

const VotingCard = ({ voting, onVote, hasVoted }: { voting: Voting, onVote: (opcion: 'favor' | 'contra') => void, hasVoted: boolean }) => {
  const [results, setResults] = useState<{favor: number, contra: number} | null>(null)
  const [showResults, setShowResults] = useState(hasVoted)

  // Sincronizar showResults cuando hasVoted cambie (después de votar)
  useEffect(() => {
    if (hasVoted) {
      setShowResults(true)
    }
  }, [hasVoted])

  const loadResults = useCallback(async () => {
    try {
      const res = await votingService.getResults(voting.id)
      setResults(res)
    } catch (e) {
      console.error(e)
    }
  }, [voting.id])

  useEffect(() => {
    if (hasVoted || showResults) {
      loadResults()

      // Suscripción Realtime para residentes (ver resultados en vivo)
      const channel = supabase
        .channel(`resident-votes-${voting.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'internal_votes',
          filter: `voting_id=eq.${voting.id}`
        }, () => {
          loadResults()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [hasVoted, showResults, voting.id, loadResults])

  const total = results ? (results.favor + results.contra) : 0
  const pctFavor = total > 0 ? Math.round((results!.favor / total) * 100) : 0
  const pctContra = total > 0 ? Math.round((results!.contra / total) * 100) : 0

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: '25px', width: '100%', boxSizing: 'border-box' }}>
       <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: '24px', margin: '0 0 10px', color: 'var(--primary-color)' }}>{voting.title}</h3>
       <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginBottom: '20px' }}>{voting.description}</p>

       {showResults && results ? (
         <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px', fontWeight: 800 }}>
               <span style={{ color: 'var(--primary-color)' }}>A FAVOR: {pctFavor}%</span>
               <span style={{ color: '#ba1a1a' }}>EN CONTRA: {pctContra}%</span>
            </div>
            <div style={{
               height: '35px',
               width: '100%',
               backgroundColor: 'var(--icon-bg)',
               borderRadius: '12px',
               overflow: 'hidden',
               display: 'flex',
               boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
            }}>
               <div style={{
                  width: `${pctFavor}%`,
                  height: '100%',
                  backgroundColor: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'width 1s ease',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 800
               }}>
                  {pctFavor > 15 ? `${pctFavor}%` : ''}
               </div>
               <div style={{
                  width: `${pctContra}%`,
                  height: '100%',
                  backgroundColor: '#ba1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'width 1s ease',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 800
               }}>
                  {pctContra > 15 ? `${pctContra}%` : ''}
               </div>
            </div>
            <p style={{ textAlign: 'center', color: 'var(--text-sub)', fontSize: '11px', marginTop: '15px', fontWeight: 600 }}>
               Total participación: {total} residentes
            </p>
         </div>
       ) : (
         <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onVote('favor')}
              style={{ ...primaryBtnStyle, flex: 1, backgroundColor: 'var(--primary-color)' }}
            >
              A Favor
            </button>
            <button
              onClick={() => onVote('contra')}
              style={{ ...primaryBtnStyle, flex: 1, backgroundColor: '#ba1a1a' }}
            >
              En Contra
            </button>
         </div>
       )}
       {hasVoted && (
         <div style={{ textAlign: 'center', color: 'var(--primary-color)', fontWeight: 700, fontSize: '14px', marginTop: '15px' }}>✓ Tu voto ha sido registrado</div>
       )}
    </div>
  )
}

const historyCardStyle = { backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '24px', padding: '25px', width: '100%', boxSizing: 'border-box' as any }
const annCardStyle = { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px' }
const annIconStyle = { width: '44px', height: '44px', backgroundColor: 'var(--icon-bg)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }
const primaryBtnStyle = { width: '100%', padding: '16px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }
