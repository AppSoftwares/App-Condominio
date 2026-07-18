import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatBs, formatUSD } from '../../utils/currency'
import { useCurrencyStore } from '../../store/useCurrencyStore'
import { supabase } from '../../lib/supabase'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import logoPremium from '../../assets/logo_premium.png'

interface Employee {
  id: string
  nombre: string
  cedula: string
  cargo: 'Vigilante' | 'Jardinero' | 'Mantenimiento'
  fecha_ingreso: string
  sueldo_usd: number
  bono_alimentacion_usd: number
  bono_transporte_usd: number
  prestamos_bs: number
  dias_descontados: number
  status: 'Activo' | 'Inactivo'
}

export const Payroll: React.FC = () => {
  const navigate = useNavigate()
  const bcvRate = useCurrencyStore(state => state.bcvRate)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editValues, setEditValues] = useState({ sueldo_usd: 0, bono_alimentacion_usd: 0, bono_transporte_usd: 0 })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('nombre')

      if (error) throw error
      setEmployees(data || [])
    } catch (err: any) {
      console.error('Error fetching employees:', err.message)
      // Fallback a mock si la tabla no existe para que no se rompa la demo de los amigos
      setEmployees([
        { id: '1', nombre: 'Carlos Ruiz', cedula: 'V-12.345.678', cargo: 'Vigilante', fecha_ingreso: '2022-01-15', sueldo_usd: 250, bono_alimentacion_usd: 40, bono_transporte_usd: 20, prestamos_bs: 0, dias_descontados: 0, status: 'Activo' },
        { id: '2', nombre: 'Maria Perez', cedula: 'V-15.987.654', cargo: 'Jardinero', fecha_ingreso: '2023-03-10', sueldo_usd: 220, bono_alimentacion_usd: 40, bono_transporte_usd: 15, prestamos_bs: 500, dias_descontados: 1, status: 'Activo' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const payrollSummary = useMemo(() => {
    const totalUSD = employees.reduce((acc, emp) => acc + emp.sueldo_usd + emp.bono_alimentacion_usd + emp.bono_transporte_usd, 0)
    return {
      totalUSD,
      totalBs: totalUSD * bcvRate,
      activeCount: employees.filter(e => e.status === 'Activo').length
    }
  }, [employees, bcvRate])

  const calculatePayroll = (emp: Employee) => {
    const sueldoBs = emp.sueldo_usd * bcvRate
    const bonoAliBs = emp.bono_alimentacion_usd * bcvRate
    const bonoTransBs = emp.bono_transporte_usd * bcvRate

    // Deducciones LOTTT contributions
    const sso = sueldoBs * 0.04
    const rpe = sueldoBs * 0.02
    const faov = (sueldoBs + bonoAliBs) * 0.01
    const inces = sueldoBs * 0.005

    const totalAsignaciones = sueldoBs + bonoAliBs + bonoTransBs
    const totalDeducciones = sso + rpe + faov + inces + emp.prestamos_bs

    return {
      sueldoBs, bonoAliBs, bonoTransBs,
      sso, rpe, faov, inces,
      totalAsignaciones, totalDeducciones,
      neto: totalAsignaciones - totalDeducciones
    }
  }

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Header Branding
    const header = [
      ["CONDOMINIO CONJUNTO 14 LAS HUERTAS"],
      ["RIF: J-29900732-3"],
      ["RELACIÓN DE NÓMINA Y PAGOS LOTTT"],
      [`TASA BCV: ${bcvRate.toFixed(2)} Bs/$`],
      []
    ];

    // Data Headers
    const tableHeaders = [
      "Empleado", "Cédula", "Cargo", "Sueldo USD",
      "Asignaciones (Bs)", "Deducciones (Bs)", "Neto a Pagar (Bs)"
    ];

    // Employee Data
    const rows = employees.map(emp => {
      const calc = calculatePayroll(emp);
      return [
        emp.nombre,
        emp.cedula,
        emp.cargo,
        emp.sueldo_usd,
        calc.totalAsignaciones.toFixed(2),
        calc.totalDeducciones.toFixed(2),
        calc.neto.toFixed(2)
      ];
    });

    const wsData = [...header, tableHeaders, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 18 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Nomina");
    XLSX.writeFile(wb, "Nomina_Condominio_Huertas.xlsx");
  }

  const generateReciboPDF = (emp: Employee) => {
    const doc = new jsPDF()
    const calc = calculatePayroll(emp)

    // Header
    doc.setFont("times", "bold")
    doc.setFontSize(18)
    doc.text("CAMINOS DE LA LAGUNITA", 105, 20, { align: 'center' })
    doc.setFontSize(10)
    doc.text("RIF: J-299007323", 105, 26, { align: 'center' })
    doc.setFontSize(12)
    doc.text("RECIBO DE PAGO DE NÓMINA", 105, 35, { align: 'center' })

    // Info
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Empleado: ${emp.nombre}`, 20, 50)
    doc.text(`Cédula: ${emp.cedula}`, 20, 56)
    doc.text(`Cargo: ${emp.cargo}`, 20, 62)
    doc.text(`Fecha de Ingreso: ${emp.fecha_ingreso}`, 20, 68)
    doc.text(`Período: 2da Quincena Junio 2026`, 140, 50)
    doc.text(`Tasa BCV: ${bcvRate.toFixed(2)} Bs/$`, 140, 56)

    // Table
    autoTable(doc, {
      startY: 80,
      head: [['ASIGNACIONES', 'MONTO BS', 'DEDUCCIONES', 'MONTO BS']],
      body: [
        ['Sueldo Base (Quincenal)', (calc.sueldoBs/2).toFixed(2), 'SSO (4%)', calc.sso.toFixed(2)],
        ['Bono Alimentación', calc.bonoAliBs.toFixed(2), 'RPE (2%)', calc.rpe.toFixed(2)],
        ['Bono Transporte', calc.bonoTransBs.toFixed(2), 'FAOV (1%)', calc.faov.toFixed(2)],
        ['', '', 'INCES (0.5%)', calc.inces.toFixed(2)],
        ['', '', 'Préstamos', emp.prestamos_bs.toFixed(2)],
        ['TOTAL ASIGNACIONES', calc.totalAsignaciones.toFixed(2), 'TOTAL DEDUCCIONES', calc.totalDeducciones.toFixed(2)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 85, 81] },
      styles: { fontSize: 9 }
    })

    const finalY = (doc as any).lastAutoTable.finalY || 150
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(`NETO A PAGAR: ${calc.neto.toLocaleString('es-VE')} Bs.D`, 105, finalY + 20, { align: 'center' })

    // Signatures
    doc.setFontSize(10)
    doc.line(40, finalY + 50, 90, finalY + 50)
    doc.text("Firma Empresa", 65, finalY + 55, { align: 'center' })

    doc.line(120, finalY + 50, 170, finalY + 50)
    doc.text("Firma Trabajador", 145, finalY + 55, { align: 'center' })

    // Legal Note
    doc.setFontSize(8)
    doc.text("NOTA LEGAL: El presente recibo cumple con lo estipulado en la Ley Orgánica del Trabajo, los Trabajadores y las Trabajadoras (LOTTT).", 105, finalY + 80, { align: 'center' })
    doc.text(`Generado el ${new Date().toLocaleString()}`, 105, finalY + 85, { align: 'center' })

    doc.save(`Recibo_Nomina_${emp.nombre}.pdf`)
  }

  const handleUpdateSalary = async () => {
    if (!selectedEmployee) return;
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          sueldo_usd: editValues.sueldo_usd,
          bono_alimentacion_usd: editValues.bono_alimentacion_usd,
          bono_transporte_usd: editValues.bono_transporte_usd
        })
        .eq('id', selectedEmployee.id)

      if (error) throw error

      alert(`Sueldo de ${selectedEmployee.nombre} actualizado correctamente.`);
      fetchEmployees()
      setIsEditMode(false);
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Error al actualizar sueldo: ' + err.message)
    }
  }

  return (
    <div style={{
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-color)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      paddingBottom: '40px',
      paddingTop: 'calc(20px + env(safe-area-inset-top))',
      width: '100%',
      boxSizing: 'border-box'
    }}>

      <header style={{ width: '100%', padding: '20px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: '20px', color: 'var(--primary-color)', fontWeight: 700, margin: 0 }}>Nómina de Empleados</h1>
            <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-sub)', letterSpacing: '1px', fontWeight: 800 }}>GESTIÓN LABORAL LOTTT</p>
          </div>
        </div>
      </header>

      <main style={{ paddingLeft: '20px', paddingRight: '20px', width: '100%', maxWidth: '1000px', boxSizing: 'border-box' }}>

        <section style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
             <button style={actionBtnStyle}>+ Nuevo Pago</button>
             <button onClick={exportToExcel} style={actionBtnStyle}><span className="material-symbols-outlined">table_view</span></button>
          </div>
          <div style={{ textAlign: 'right' }}>
             <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-sub)', fontWeight: 700 }}>TASA BCV INMUTABLE</p>
             <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#C6A059' }}>{bcvRate.toFixed(2)} Bs/$</p>
          </div>
        </section>

        {/* Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '30px' }}>
           <StatCard label="Empleados Activos" value={payrollSummary.activeCount.toString()} color="var(--primary-color)" />
           <StatCard label="Total USD" value={formatUSD(payrollSummary.totalUSD)} color="#C6A059" />
           <StatCard label="Total Bs.D" value={formatBs(payrollSummary.totalUSD, bcvRate)} color="var(--primary-color)" />
        </div>

        {/* Employee Table */}
        <div style={cardStyle}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={thStyle}>Empleado</th>
                  <th style={thStyle}>Sueldo USD</th>
                  <th style={thStyle}>Neto Bs.D</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const calc = calculatePayroll(emp)
                  return (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--icon-bg)' }}>
                      <td style={tdStyle}>
                        <p style={{ margin: 0, fontWeight: 700 }}>{emp.nombre}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-sub)' }}>{emp.cedula}</p>
                        <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', backgroundColor: emp.cargo === 'Vigilante' ? 'rgba(15, 85, 81, 0.1)' : 'rgba(198, 160, 89, 0.1)', color: 'var(--primary-color)', marginTop: '4px', display: 'inline-block' }}>{emp.cargo.toUpperCase()}</span>
                      </td>
                      <td style={tdStyle}>{formatUSD(emp.sueldo_usd)}</td>
                      <td style={{ ...tdStyle, fontWeight: 800, color: 'var(--primary-color)' }}>{calc.neto.toLocaleString('es-VE')} Bs.D</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                           <button onClick={() => { setSelectedEmployee(emp); setIsEditMode(false); setIsModalOpen(true); }} style={miniBtnStyle}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span></button>
                           <button onClick={() => {
                             setSelectedEmployee(emp);
                             setEditValues({ sueldo_usd: emp.sueldo_usd, bono_alimentacion_usd: emp.bono_alimentacion_usd, bono_transporte_usd: emp.bono_transporte_usd });
                             setIsEditMode(true);
                             setIsModalOpen(true);
                           }} style={{ ...miniBtnStyle, borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' }}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
                           <button onClick={() => generateReciboPDF(emp)} style={miniBtnStyle}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>picture_as_pdf</span></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Slide-over */}
      {isModalOpen && selectedEmployee && (
        <div style={modalOverlayStyle} onClick={() => setIsModalOpen(false)}>
           <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                 <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: '26px', color: 'var(--primary-color)' }}>
                    {isEditMode ? 'Ajustar Sueldo y Bonos' : 'Detalle de Liquidación'}
                 </h2>
                 <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                   <span className="material-symbols-outlined">close</span>
                 </button>
              </div>

              <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                 <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: '#C6A059' }}>{selectedEmployee.cargo.toUpperCase()}</p>
                 <h3 style={{ margin: '5px 0', fontSize: '22px' }}>{selectedEmployee.nombre}</h3>
                 <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-sub)' }}>ID: {selectedEmployee.cedula}</p>
              </div>

              {isEditMode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>Sueldo Base (USD)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      style={inputStyle}
                      value={editValues.sueldo_usd}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        setEditValues({...editValues, sueldo_usd: parseFloat(val) || 0});
                      }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Bono Alimentación (USD)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      style={inputStyle}
                      value={editValues.bono_alimentacion_usd}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        setEditValues({...editValues, bono_alimentacion_usd: parseFloat(val) || 0});
                      }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Bono Transporte (USD)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      style={inputStyle}
                      value={editValues.bono_transporte_usd}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        setEditValues({...editValues, bono_transporte_usd: parseFloat(val) || 0});
                      }}
                    />
                  </div>
                  <button style={{ ...primaryBtnStyle, marginTop: '20px' }} onClick={handleUpdateSalary}>
                    Guardar Cambios
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                   <section>
                      <h4 style={sectionTitleStyle}>ASIGNACIONES</h4>
                      <DetailRow label="Sueldo Base" value={formatBs(selectedEmployee.sueldo_usd, bcvRate)} />
                      <DetailRow label="Bono Alimentación" value={formatBs(selectedEmployee.bono_alimentacion_usd, bcvRate)} />
                      <DetailRow label="Bono Transporte" value={formatBs(selectedEmployee.bono_transporte_usd, bcvRate)} />
                   </section>

                   <section>
                      <h4 style={{ ...sectionTitleStyle, color: '#ba1a1a' }}>DEDUCCIONES LOTTT</h4>
                      <DetailRow label="SSO (4%)" value={`${calculatePayroll(selectedEmployee).sso.toFixed(2)} Bs`} isRed />
                      <DetailRow label="RPE (2%)" value={`${calculatePayroll(selectedEmployee).rpe.toFixed(2)} Bs`} isRed />
                      <DetailRow label="FAOV (1%)" value={`${calculatePayroll(selectedEmployee).faov.toFixed(2)} Bs`} isRed />
                      <DetailRow label="INCES (0.5%)" value={`${calculatePayroll(selectedEmployee).inces.toFixed(2)} Bs`} isRed />
                   </section>

                   <section>
                      <h4 style={{ ...sectionTitleStyle, color: '#C6A059' }}>PROYECCIÓN PRESTACIONES SOCIALES (LOTTT)</h4>
                      <DetailRow label="Días Antigüedad Acumulados" value="15 días" />
                      <DetailRow label="Monto Prestaciones (Proyectado)" value="45.200,00 Bs" />
                      <DetailRow label="Intereses s/ Prestaciones" value="3.450,00 Bs" />
                      <DetailRow label="TOTAL ACUMULADO" value="48.650,00 Bs" />
                   </section>

                   <div style={totalNetoCardStyle}>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, opacity: 0.8 }}>TOTAL NETO MES ACTUAL</p>
                      <h3 style={{ margin: '10px 0 0', fontSize: '32px', fontWeight: 900 }}>
                        {calculatePayroll(selectedEmployee).neto.toLocaleString('es-VE')} <span style={{ fontSize: '16px' }}>Bs.D</span>
                      </h3>
                   </div>

                   <button style={primaryBtnStyle} onClick={() => alert('Sincronizado con base de datos')}>Guardar en Historial</button>
                </div>
              )}
           </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  )
}

const StatCard = ({ label, value, color }: any) => (
  <div style={{ ...cardStyle, padding: '20px', border: 'none', backgroundColor: 'var(--icon-bg)' }}>
    <p style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: 'var(--text-sub)', letterSpacing: '1px' }}>{label.toUpperCase()}</p>
    <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: 800, color }}>{value}</p>
  </div>
)

const DetailRow = ({ label, value, isRed }: any) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--icon-bg)' }}>
    <span style={{ fontSize: '14px', color: 'var(--text-sub)' }}>{label}</span>
    <span style={{ fontSize: '14px', fontWeight: 700, color: isRed ? '#ba1a1a' : 'var(--text-color)' }}>{value}</span>
  </div>
)

const actionBtnStyle = { backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--primary-color)', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: 700 }
const cardStyle = { backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' as any, padding: '30px' }
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '8px', textTransform: 'uppercase' as any, letterSpacing: '0.5px' }
const inputStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)', fontSize: '14px', outline: 'none' }
const thStyle = { textAlign: 'left' as any, padding: '10px', fontSize: '11px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' as any, letterSpacing: '1px' }
const tdStyle = { padding: '10px', fontSize: '14px' }
const miniBtnStyle = { background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-sub)', padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }
const modalOverlayStyle = { position: 'fixed' as any, top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }
const modalContentStyle = { width: '100%', maxWidth: '500px', height: '100%', backgroundColor: 'var(--card-bg)', padding: '40px', boxSizing: 'border-box' as any, animation: 'slideIn 0.3s ease-out', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', overflowY: 'auto' as any }
const sectionTitleStyle = { fontSize: '12px', fontWeight: 800, color: 'var(--primary-color)', letterSpacing: '2px', marginBottom: '15px', borderLeft: '4px solid', paddingLeft: '10px' }
const totalNetoCardStyle = { backgroundColor: 'var(--primary-color)', color: 'white', padding: '30px', borderRadius: '24px', marginTop: '10px' }
const primaryBtnStyle = { width: '100%', padding: '18px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }
