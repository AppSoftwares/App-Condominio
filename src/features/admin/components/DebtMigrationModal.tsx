import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../shared/lib/supabase'
import { useAuthStore } from '../../../app/store/useAuthStore'
import { parseStatementExcel, parseStatementPdf, ParsedStatement } from '../../../shared/utils/parseAccountStatement'

interface DebtMigrationModalProps {
  onClose: () => void
  onDone: () => void
}

interface QueueItem {
  id: string
  file: File
  status: 'pending' | 'parsing' | 'matched' | 'applied' | 'error'
  parsed?: ParsedStatement
  selectedResidentId?: string
  error?: string
}

export const DebtMigrationModal: React.FC<DebtMigrationModalProps> = ({ onClose, onDone }) => {
  const user = useAuthStore(s => s.user)
  const isSuperAdmin = user?.role === 'superadmin'
  const adminCluster = user?.residential_cluster || ''

  const [selectedCluster, setSelectedCluster] = useState<string>(adminCluster)
  const [clustersList, setClustersList] = useState<string[]>([])
  const [residents, setResidents] = useState<any[]>([])

  const [mode, setMode] = useState<'batch' | 'manual'>('batch')
  const [fileQueue, setFileQueue] = useState<QueueItem[]>([])
  const [batchRunning, setBatchRunning] = useState(false)
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 })
  const [batchResults, setBatchResults] = useState<Array<{ fileName: string; owner: string; house: string; balance: number; status: string; message: string }>>([])

  const [allowPartial, setAllowPartial] = useState(true)
  const [replaceExisting, setReplaceExisting] = useState(false)
  const [confirmedCheck, setConfirmedCheck] = useState(false)

  // Manual form state
  const [manualResidentId, setManualResidentId] = useState('')
  const [manualBalance, setManualBalance] = useState('')
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0])
  const [manualNote, setManualNote] = useState('')

  // Confirmation & status dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [existingActiveMigration, setExistingActiveMigration] = useState(false)

  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    modalRef.current?.focus()
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    if (isSuperAdmin) {
      supabase.from('profiles').select('residential_cluster').not('residential_cluster', 'is', null).then(({ data }) => {
        if (data) {
          const unique = Array.from(new Set(data.map(d => d.residential_cluster))).filter(Boolean) as string[]
          setClustersList(unique)
        }
      })
    }
  }, [isSuperAdmin])

  useEffect(() => {
    const clusterToFetch = isSuperAdmin ? selectedCluster : adminCluster
    if (!clusterToFetch) return

    supabase.from('profiles')
      .select('id, first_name, last_name, house_number, residential_cluster')
      .eq('role', 'resident')
      .ilike('residential_cluster', `%${clusterToFetch.replace(/Conjunto\s+\d+\s+/i, '').trim()}%`)
      .then(({ data }) => {
        setResidents(data || [])
      })
  }, [selectedCluster, adminCluster, isSuperAdmin])

  const findBestResidentMatch = (parsed: ParsedStatement, residentList: any[]) => {
    const fileHouse = (parsed.houseNumber || '').toUpperCase().trim()
    const fileName = (parsed.ownerName || '').toLowerCase()

    let bestMatch: any = null
    let bestScore = 0

    for (const r of residentList) {
      const rHouse = (r.house_number || '').toUpperCase().trim()
      const rName = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase()

      let score = 0
      if (fileHouse && rHouse && (rHouse === fileHouse || rHouse.replace(/-/g,'') === fileHouse.replace(/-/g,''))) {
        score += 0.7
      }

      const fileWords = fileName.split(/\s+/)
      const rWords = rName.split(/\s+/)
      let matchedWords = 0
      for (const w of fileWords) {
        if (w.length > 2 && rWords.some(rw => rw.includes(w) || w.includes(rw))) matchedWords++
      }
      if (fileWords.length > 0) {
        score += (matchedWords / fileWords.length) * 0.3
      }

      if (score > bestScore) {
        bestScore = score
        bestMatch = r
      }
    }

    return bestMatch && bestScore >= 0.4 ? bestMatch.id : residentList[0]?.id || ''
  }

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newQueueItems: QueueItem[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      newQueueItems.push({
        id: `file-${Date.now()}-${i}`,
        file,
        status: 'parsing'
      })
    }

    setFileQueue(prev => [...prev, ...newQueueItems])

    // Parse each file
    for (const item of newQueueItems) {
      try {
        const isPdf = item.file.type === 'application/pdf' || item.file.name.toLowerCase().endsWith('.pdf')
        let result: ParsedStatement

        if (isPdf) {
          result = await parseStatementPdf(item.file)
        } else {
          result = await parseStatementExcel(item.file, item.file.name)
        }

        const matchedId = findBestResidentMatch(result, residents)

        setFileQueue(prev => prev.map(q => q.id === item.id ? {
          ...q,
          status: 'matched',
          parsed: result,
          selectedResidentId: matchedId
        } : q))
      } catch (err: any) {
        console.error(err)
        setFileQueue(prev => prev.map(q => q.id === item.id ? {
          ...q,
          status: 'error',
          error: err.message || 'Error al procesar archivo'
        } : q))
      }
    }
  }

  const runBatchMigration = async () => {
    const readyItems = fileQueue.filter(q => q.status === 'matched' && q.selectedResidentId && q.parsed && (q.parsed.finalBalance || 0) > 0)
    if (readyItems.length === 0) {
      alert('No hay archivos listos con saldo válido para migrar.')
      return
    }

    setBatchRunning(true)
    setBatchProgress({ current: 0, total: readyItems.length })
    const results: Array<{ fileName: string; owner: string; house: string; balance: number; status: string; message: string }> = []

    for (let i = 0; i < readyItems.length; i++) {
      const item = readyItems[i]
      setBatchProgress({ current: i + 1, total: readyItems.length })
      const resident = residents.find(r => r.id === item.selectedResidentId)
      const resName = resident ? `${resident.first_name} ${resident.last_name}` : 'Desconocido'
      const houseNum = resident ? resident.house_number : 'N/A'
      const balance = item.parsed?.finalBalance || 0

      try {
        const { error } = await supabase.rpc('rpc_migrate_debt', {
          p_residente_id: item.selectedResidentId,
          p_as_of: item.parsed?.asOfDate || new Date().toISOString().split('T')[0],
          p_balance: balance,
          p_lines: item.parsed?.lines ? JSON.parse(JSON.stringify(item.parsed.lines)) : null,
          p_source_type: item.parsed?.sourceType || 'xlsx',
          p_file_name: item.parsed?.fileName || item.file.name,
          p_replace: replaceExisting,
          p_allow_partial: allowPartial
        })

        if (error) throw error

        setFileQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'applied' } : q))
        results.push({ fileName: item.file.name, owner: resName, house: houseNum, balance, status: 'Éxito', message: 'Migrado correctamente' })
      } catch (err: any) {
        console.error(err)
        setFileQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error', error: err.message } : q))
        results.push({ fileName: item.file.name, owner: resName, house: houseNum, balance, status: 'Error', message: err.message || 'Error desconocido' })
      }
    }

    setBatchResults(results)
    setBatchRunning(false)
    setSubmitSuccess(true)
  }

  const exportBatchCsv = () => {
    const headers = ['Archivo', 'Propietario', 'Casa', 'Saldo', 'Estado', 'Mensaje']
    const rows = batchResults.map(r => [
      `"${r.fileName}"`,
      `"${r.owner}"`,
      `"${r.house}"`,
      r.balance.toFixed(2),
      `"${r.status}"`,
      `"${r.message}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `resumen_migracion_lotes_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleApplyManual = async () => {
    if (!manualResidentId || !manualBalance) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const { error } = await supabase.rpc('rpc_migrate_debt', {
        p_residente_id: manualResidentId,
        p_as_of: manualDate,
        p_balance: parseFloat(manualBalance) || 0,
        p_lines: null,
        p_source_type: 'manual',
        p_file_name: null,
        p_replace: replaceExisting,
        p_allow_partial: allowPartial
      })

      if (error) throw error
      setSubmitSuccess(true)
    } catch (err: any) {
      console.error(err)
      setSubmitError(err.message || 'Error desconocido')
    } finally {
      setSubmitting(false)
      setShowConfirmDialog(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dm-title"
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderRadius: '28px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', outline: 'none' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
          <h2 id="dm-title" style={{ fontFamily: "'Cinzel', serif", fontSize: '20px', color: 'var(--primary-color)', margin: 0 }}>
            Migración de Deudas en Lotes (Batch Statements)
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--text-color)' }}>close</span>
          </button>
        </div>

        {isSuperAdmin && (
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Conjunto Residencial</label>
            <select
              value={selectedCluster}
              onChange={e => setSelectedCluster(e.target.value)}
              style={inputStyle}
            >
              {clustersList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => setMode('batch')}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: mode === 'batch' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', background: mode === 'batch' ? 'var(--icon-bg)' : 'transparent', fontWeight: 700, cursor: 'pointer', color: 'var(--text-color)' }}
          >
            Subir Lote de Estados de Cuenta (Múltiples)
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: mode === 'manual' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', background: mode === 'manual' ? 'var(--icon-bg)' : 'transparent', fontWeight: 700, cursor: 'pointer', color: 'var(--text-color)' }}
          >
            Ingreso Manual Individual
          </button>
        </div>

        {submitSuccess && mode === 'batch' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#2e7d32', marginBottom: '16px' }}>check_circle</span>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>¡Lote procesado exitosamente!</h3>
            <p style={{ color: 'var(--text-sub)', marginBottom: '20px' }}>Se procesaron {fileQueue.length} archivos con sus respectivas asignaciones.</p>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button type="button" onClick={exportBatchCsv} style={{ ...primaryBtnStyle, background: 'var(--accent-gold)' }}>
                Descargar Resumen CSV
              </button>
              <button type="button" onClick={onDone} style={primaryBtnStyle}>
                Finalizar y Cerrar
              </button>
            </div>
          </div>
        ) : submitSuccess ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#2e7d32', marginBottom: '16px' }}>check_circle</span>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>¡Deuda migrada con éxito!</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setSubmitSuccess(false)} style={primaryBtnStyle}>Migrar otro</button>
              <button type="button" onClick={onDone} style={{ ...primaryBtnStyle, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>Cerrar</button>
            </div>
          </div>
        ) : mode === 'batch' ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Seleccionar Múltiples Archivos (Excel / PDF)</label>
              <input
                type="file"
                multiple
                accept=".xlsx,.xls,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFilesSelected}
                disabled={batchRunning}
                style={{ ...inputStyle, padding: '10px' }}
              />
              <p style={{ fontSize: '11px', color: 'var(--text-sub)', marginTop: '6px' }}>
                Puedes seleccionar varios archivos simultáneamente. Procesamiento local seguro.
              </p>
            </div>

            {fileQueue.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>Cola de Archivos ({fileQueue.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                  {fileQueue.map(item => {
                    const resident = residents.find(r => r.id === item.selectedResidentId)
                    return (
                      <div key={item.id} style={{ backgroundColor: 'var(--icon-bg)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '14px' }}>{item.file.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                            {item.status === 'parsing' && 'Leyendo archivo...'}
                            {item.status === 'matched' && `Saldo: $${item.parsed?.finalBalance?.toFixed(2) || 0} • Casa ${item.parsed?.houseNumber || 'N/A'}`}
                            {item.status === 'applied' && '✔ Aplicado exitosamente'}
                            {item.status === 'error' && <span style={{ color: '#ba1a1a' }}>Error: {item.error}</span>}
                          </div>
                        </div>

                        {item.status === 'matched' && (
                          <div style={{ width: '220px' }}>
                            <select
                              value={item.selectedResidentId || ''}
                              onChange={e => {
                                const val = e.target.value
                                setFileQueue(prev => prev.map(q => q.id === item.id ? { ...q, selectedResidentId: val } : q))
                              }}
                              style={{ ...inputStyle, padding: '8px', fontSize: '12px' }}
                            >
                              <option value="">-- Seleccionar Propietario --</option>
                              {residents.map(r => (
                                <option key={r.id} value={r.id}>Casa {r.house_number} - {r.first_name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {fileQueue.length > 0 && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={allowPartial} onChange={e => setAllowPartial(e.target.checked)} />
                    <span>Permitir abonos parciales</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={replaceExisting} onChange={e => setReplaceExisting(e.target.checked)} />
                    <span>Reemplazar migraciones anteriores si no tienen abonos</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={confirmedCheck} onChange={e => setConfirmedCheck(e.target.checked)} />
                    <span style={{ fontWeight: 700 }}>Confirmo que las asignaciones y montos son correctos.</span>
                  </label>
                </div>

                <button
                  type="button"
                  disabled={batchRunning || !confirmedCheck || fileQueue.filter(q => q.status === 'matched').length === 0}
                  onClick={runBatchMigration}
                  style={{ ...primaryBtnStyle, opacity: (batchRunning || !confirmedCheck) ? 0.6 : 1 }}
                >
                  {batchRunning ? `Aplicando (${batchProgress.current}/${batchProgress.total})...` : `Aplicar Lote (${fileQueue.filter(q => q.status === 'matched').length} archivos listos)`}
                </button>
              </>
            )}
          </div>
        ) : (
          /* MANUAL TAB */
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>Propietario</label>
                <select
                  value={manualResidentId}
                  onChange={e => setManualResidentId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">-- Selecciona un residente --</option>
                  {residents.map(r => (
                    <option key={r.id} value={r.id}>
                      Casa {r.house_number} - {r.first_name} {r.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Saldo Pendiente (US$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 625.00"
                  value={manualBalance}
                  onChange={e => setManualBalance(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Fecha de Corte</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={e => setManualDate(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Nota / Concepto opcional</label>
                <input
                  type="text"
                  placeholder="Ej: Saldo pendiente acumulado"
                  value={manualNote}
                  onChange={e => setManualNote(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={confirmedCheck}
                  onChange={e => setConfirmedCheck(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--primary-color)' }}
                />
                <span style={{ fontWeight: 700 }}>Verifiqué que los datos son correctos.</span>
              </label>
            </div>

            {submitError && (
              <div role="alert" style={{ marginBottom: '16px', padding: '12px', background: 'rgba(186,26,26,0.1)', color: '#ba1a1a', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}>
                {submitError}
              </div>
            )}

            <button
              type="button"
              disabled={!manualResidentId || !manualBalance || !confirmedCheck || submitting}
              onClick={() => setShowConfirmDialog(true)}
              style={{ ...primaryBtnStyle, opacity: (!manualResidentId || !manualBalance || !confirmedCheck) ? 0.6 : 1 }}
            >
              {submitting ? 'Guardando...' : 'Guardar Saldo Manual'}
            </button>
          </div>
        )}
      </div>

      {showConfirmDialog && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '28px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: 'var(--primary-color)' }}>Confirmar Saldo Manual</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginBottom: '20px', lineHeight: 1.5 }}>
              Guardar saldo de <strong style={{ color: 'var(--primary-color)' }}>US$ {Number(manualBalance).toFixed(2)}</strong> para el residente seleccionado.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                style={{ flex: 1, padding: '14px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', color: 'var(--text-color)' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleApplyManual}
                style={{ flex: 1, padding: '14px', background: 'var(--primary-color)', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', color: 'white' }}
              >
                {submitting ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '8px', textTransform: 'uppercase' as const }
const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--icon-bg)', fontSize: '15px', boxSizing: 'border-box' as const, outline: 'none', color: 'var(--text-color)' }
const primaryBtnStyle = { width: '100%', padding: '16px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', fontSize: '16px', marginTop: '16px' }
