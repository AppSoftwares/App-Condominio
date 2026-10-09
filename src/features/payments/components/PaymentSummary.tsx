import React from 'react'
import { formatBs, formatUSD } from '../../../shared/utils/currency'
import { ConsentCheckbox } from '../../legal/ConsentCheckbox'

interface Item {
  label: string
  usd: number
}

interface Props {
  items: Item[]
  fees?: Item[]
  rate: {
    value: number
    updatedAt: string | null
    source: 'live' | 'cached' | 'fallback'
    isFallback: boolean
  }
  confirmed: boolean
  onConfirmChange: (v: boolean) => void
  error?: string | null
}

export const PaymentSummary: React.FC<Props> = ({ items, fees = [], rate, confirmed, onConfirmChange, error }) => {
  const itemsTotalUSD = items.reduce((acc, i) => acc + i.usd, 0)
  const feesTotalUSD = fees.reduce((acc, f) => acc + f.usd, 0)
  const totalUSD = itemsTotalUSD + feesTotalUSD

  const isStale = rate.isFallback || rate.source === 'fallback' || (rate.updatedAt && (Date.now() - new Date(rate.updatedAt).getTime() > 24 * 60 * 60 * 1000))

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '20px', marginBottom: '20px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Resumen Transparente del Pago
      </h3>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-sub)', textAlign: 'left' }}>
            <th style={{ paddingBottom: '8px' }}>Concepto</th>
            <th style={{ paddingBottom: '8px', textAlign: 'right' }}>USD</th>
            <th style={{ paddingBottom: '8px', textAlign: 'right' }}>Bs.</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '10px 0' }}>{item.label}</td>
              <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>{formatUSD(item.usd)}</td>
              <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>{formatBs(item.usd, rate.value)}</td>
            </tr>
          ))}
          {fees.length === 0 ? (
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-sub)' }}>
              <td style={{ padding: '10px 0' }}>Comisiones de la plataforma</td>
              <td style={{ padding: '10px 0', textAlign: 'right' }}>$0,00</td>
              <td style={{ padding: '10px 0', textAlign: 'right' }}>0,00 Bs</td>
            </tr>
          ) : (
            fees.map((fee, idx) => (
              <tr key={`fee-${idx}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px 0' }}>{fee.label}</td>
                <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>{formatUSD(fee.usd)}</td>
                <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>{formatBs(fee.usd, rate.value)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div aria-live="polite" style={{ backgroundColor: 'var(--icon-bg)', padding: '15px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)', display: 'block' }}>TOTAL A PAGAR</span>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-color)' }}>{formatUSD(totalUSD)}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)', display: 'block' }}>EQUIVALENTE</span>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-color)' }}>{formatBs(totalUSD, rate.value)}</span>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '15px', lineHeight: 1.4 }}>
        <p style={{ margin: 0 }}>
          Tasa BCV aplicada: <strong>{rate.value.toFixed(2)} Bs/$</strong> — actualizada el {rate.updatedAt ? new Date(rate.updatedAt).toLocaleString() : 'Reciente'} — fuente: {rate.source.toUpperCase()}.
        </p>
      </div>

      {isStale && (
        <div role="alert" style={{ backgroundColor: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '12px', padding: '12px', marginBottom: '15px', color: '#c53030', fontSize: '12px', fontWeight: 600 }}>
          ⚠️ Tasa referencial no actualizada. El monto final en Bs. lo confirma la administración.
        </div>
      )}

      <ConsentCheckbox id="pay-confirm" checked={confirmed} onChange={onConfirmChange} required error={error}>
        Confirmo que el comprobante adjunto es auténtico y que los montos indicados son correctos.
      </ConsentCheckbox>
    </div>
  )
}
