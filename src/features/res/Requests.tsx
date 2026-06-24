import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useCommunityStore } from '../../store/useCommunityStore'

export const Requests: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { polls, announcements, voteInPoll } = useCommunityStore()

  const handleVote = (pollId: string, idx: number) => {
    const houseNumber = user?.house_number || 'UNKNOWN'
    const success = voteInPoll(pollId, idx, houseNumber)
    if (success) {
      alert('¡Voto registrado con éxito! Solo se permite un voto por casa.')
    } else {
      alert('Esta casa ya ha emitido su voto en esta encuesta.')
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(15, 85, 81, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">person</span>
          </div>
          <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: '20px', color: 'var(--primary-color)', fontWeight: 700, margin: 0 }}>Condominio</h1>
        </div>
      </header>

      <main style={{ paddingTop: '100px', paddingLeft: '20px', paddingRight: '20px', width: '100%', maxWidth: '600px', boxSizing: 'border-box' }}>
        <section style={{ marginBottom: '30px' }}>
           <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: '32px', color: 'var(--primary-color)', margin: '0 0 10px 0' }}>Portal de Comunidad</h2>
           <p style={{ fontSize: '14px', color: 'var(--text-sub)', margin: 0 }}>Participe en las decisiones de nuestra comunidad.</p>
        </section>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
           <span className="material-symbols-outlined" style={{ color: '#785919' }}>how_to_vote</span>
           <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Votaciones Activas</h3>
        </div>

        {polls.map(poll => (
          <PollCard
            key={poll.id}
            poll={poll}
            hasVoted={poll.votedHouses.includes(user?.house_number || 'UNKNOWN')}
            onVote={(idx) => handleVote(poll.id, idx)}
          />
        ))}

        <div style={historyCardStyle}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="material-symbols-outlined">history</span>
              <h4 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Historial</h4>
           </div>
           <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>Resultados de votaciones anteriores.</p>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 700, marginTop: '40px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Comunicados</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
           {announcements.map(ann => (
             <div key={ann.id} style={annCardStyle}>
                <div style={annIconStyle}>
                   <span className="material-symbols-outlined">{ann.type === 'PDF' ? 'picture_as_pdf' : 'event_note'}</span>
                </div>
                <div style={{ flex: 1 }}>
                   <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>{ann.title}</p>
                   <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-sub)' }}>{ann.date}</p>
                </div>
                <span className="material-symbols-outlined" style={{ color: 'var(--text-sub)', fontSize: '20px' }}>download</span>
             </div>
           ))}
        </div>
      </main>
    </div>
  )
}

const PollCard = ({ poll, onVote, hasVoted }: { poll: any, onVote: (idx: number) => void, hasVoted: boolean }) => {
  const [selected, setSelected] = useState<number | null>(null)
  return (
    <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: '25px', width: '100%', boxSizing: 'border-box' }}>
       <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: '24px', margin: '0 0 10px', color: 'var(--primary-color)' }}>{poll.title}</h3>
       <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginBottom: '20px' }}>{poll.description}</p>

       <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
          {poll.options.map((opt: any, idx: number) => {
            const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0
            const isSelected = selected === idx
            return (
              <div
                key={idx}
                onClick={() => !hasVoted && setSelected(idx)}
                style={{
                  cursor: hasVoted ? 'default' : 'pointer',
                  padding: '10px',
                  borderRadius: '12px',
                  backgroundColor: isSelected ? 'rgba(15, 85, 81, 0.05)' : 'transparent',
                  border: isSelected ? '1px solid var(--primary-color)' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!hasVoted && (
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          border: '2px solid var(--primary-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }}></div>}
                        </div>
                      )}
                      <span>{opt.text}</span>
                    </div>
                    {hasVoted && <span>{pct}%</span>}
                 </div>
                 <div style={{ height: '8px', backgroundColor: 'var(--icon-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: idx === 0 ? 'var(--primary-color)' : '#C6A059', transition: 'width 0.8s ease' }}></div>
                 </div>
              </div>
            )
          })}
       </div>
       {hasVoted ? (
         <div style={{ textAlign: 'center', color: 'var(--primary-color)', fontWeight: 700, fontSize: '14px' }}>✓ Tu casa ya participó</div>
       ) : (
         <button
          onClick={() => selected !== null && onVote(selected)}
          disabled={selected === null}
          style={{
            ...primaryBtnStyle,
            opacity: selected === null ? 0.5 : 1,
            cursor: selected === null ? 'not-allowed' : 'pointer'
          }}
         >
          Votar
         </button>
       )}
    </div>
  )
}

const headerStyle = { position: 'fixed' as any, top: 0, width: '100%', height: '64px', backgroundColor: 'var(--header-bg)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }
const historyCardStyle = { backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '24px', padding: '25px', width: '100%', boxSizing: 'border-box' as any }
const annCardStyle = { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px' }
const annIconStyle = { width: '44px', height: '44px', backgroundColor: 'var(--icon-bg)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }
const primaryBtnStyle = { width: '100%', padding: '16px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }
