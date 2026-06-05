import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { BCV_RATE, formatBs, formatUSD } from '../../utils/currency'

export const AdminManagement: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'finance' | 'users'>('finance')

  const exportReport = (format: 'PDF' | 'Excel') => {
    if (format === 'PDF') {
      const printContents = document.getElementById('printable-report')?.innerHTML
      const originalContents = document.body.innerHTML
      if (printContents) {
        document.body.innerHTML = printContents
        window.print()
        document.body.innerHTML = originalContents
        window.location.reload()
      } else {
        window.print()
      }
    } else {
      // Generación de CSV para Excel
      const headers = ['Categoría', 'Descripción', 'Monto (USD)', 'Monto (Bs)']
      const rows = [
        ['Ingresos', 'Cuotas Ordinarias Mayo', '1240.00', (1240 * BCV_RATE).toFixed(2)],
        ['Egresos', 'Nómina Vigilancia', '450.00', (450 * BCV_RATE).toFixed(2)],
        ['Egresos', 'Jardinería', '60.00', (60 * BCV_RATE).toFixed(2)],
        ['Egresos', 'Servicios Públicos', '145.00', (145 * BCV_RATE).toFixed(2)],
        ['Resumen', 'Saldo en Caja', '254.60', (254.60 * BCV_RATE).toFixed(2)]
      ]

      let csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      csvContent += headers.join(';') + "\n"
      rows.forEach(row => {
        csvContent += row.join(';') + "\n"
      })

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", "Reporte_Financiero_Junio_2026.csv")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const [users, setUsers] = useState([
    { id: 1, name: "Carlos Mendoza", email: "carlos@email.com", role: "Propietario", status: "Validado" },
    { id: 2, name: "Ana Rodríguez", email: "ana.r@email.com", role: "Propietario", status: "Pendiente" },
    { id: 3, name: "Juan Tesorero", email: "tesoreria@caminos.com", role: "Tesorero", status: "Activo" },
    { id: 4, name: "Vigilante G1", email: "vigilante@email.com", role: "Vigilante", status: "Activo" },
  ]);

  const validateUser = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'Validado' } : u));
    alert(`Usuario validado correctamente.`);
  }

  const deleteUser = (id: number, name: string) => {
    if (window.confirm(`¿Está seguro de que desea eliminar permanentemente al usuario ${name}? Esta acción no se puede deshacer.`)) {
      setUsers(users.filter(u => u.id !== id));
      alert(`Usuario ${name} eliminado del sistema.`);
    }
  }

  const changeRole = (id: number, newRole: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    alert(`Rol actualizado a ${newRole.toUpperCase()}.`);
  }

  const toggleUserStatus = (id: number) => {
    const reason = prompt('Indique el motivo de la desactivación (ej. mudanza, pérdida de teléfono):')
    if (reason) {
      setUsers(users.map(u => u.id === id ? { ...u, status: 'Desactivado' } : u));
      alert(`Usuario desactivado correctamente.\nMotivo: ${reason}`);
    }
  }

  const createVigilante = () => {
    const name = prompt('Nombre del nuevo vigilante:');
    if (name) {
      const newUser = {
        id: Date.now(),
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@caminos.com`,
        role: "Vigilante",
        status: "Activo"
      };
      setUsers([...users, newUser]);
      alert(`Vigilante ${name} creado exitosamente.\nCredenciales enviadas al correo.`);
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', fontFamily: "'Inter', sans-serif", color: '#1B1C1A', paddingBottom: '100px' }}>
      <style>{`
        * { box-sizing: border-box; }
        @media print {
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report { position: absolute; left: 0; top: 0; width: 100%; display: block !important; }
        }
        @media (max-width: 600px) {
          .stat-grid { grid-template-columns: 1fr !important; }
          .header-title { font-size: 16px !important; }
          .nav-label { font-size: 10px !important; }
        }
      `}</style>

      {/* Top AppBar */}
      <header style={{ position: 'fixed', top: 0, width: '100%', height: '64px', backgroundColor: 'white', borderBottom: '1px solid #bfc8c7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2f6d69', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>admin_panel_settings</span>
          </div>
          <h1 className="header-title" style={{ fontFamily: "'EB Garamond', serif", fontSize: '18px', color: '#0f5551', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Panel Administrativo</h1>
        </div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f5551', display: 'flex' }}>
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main style={{ paddingTop: '84px', paddingLeft: '20px', paddingRight: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'finance' ? (
          <div id="finance-view">
            {/* Title Section */}
            <section style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#785919', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 5px 0' }}>Caminos de la Lagunita</p>
                <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: '32px', color: '#1B1C1A', margin: 0 }}>Administración - Junio 2026</h2>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid #bfc8c7', borderRadius: '12px', padding: '12px 20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right', marginRight: '10px' }}>
                   <p style={{ margin: 0, fontSize: '10px', color: '#6f7978', fontWeight: 700 }}>TASA BCV</p>
                   <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f5551' }}>{BCV_RATE.toFixed(2)} Bs/$</p>
                </div>
                <div style={{ width: '1px', height: '30px', backgroundColor: '#bfc8c7' }}></div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => exportReport('PDF')} style={{ backgroundColor: '#0f5551', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>picture_as_pdf</span> PDF
                  </button>
                  <button onClick={() => exportReport('Excel')} style={{ backgroundColor: '#fed488', color: '#271900', border: 'none', padding: '8px 15px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>table_view</span> Excel
                  </button>
                </div>
              </div>
            </section>

            {/* Top Cards (Bento) */}
            <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <StatCard title="Ingresos Totales" amount={formatUSD(1240)} sub={formatBs(1240)} color="#0f5551" trend="+12% vs Mayo" icon="trending_up" />
              <StatCard title="Gastos Totales" amount={formatUSD(985.40)} sub={formatBs(985.40)} color="#ba1a1a" trend="Actualizado Hoy" icon="schedule" />
              <div style={{ backgroundColor: '#0f5551', borderRadius: '20px', padding: '20px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                 <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 600, opacity: 0.8 }}>SALDO CAJA</p>
                 <h3 style={{ margin: '0 0 4px 0', fontSize: '32px', fontWeight: 700 }}>{formatUSD(254.60)}</h3>
                 <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>{formatBs(254.60)}</p>
                 <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Cuentas Cuadradas</span>
                 </div>
                 <span className="material-symbols-outlined" style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '80px', opacity: 0.1 }}>savings</span>
              </div>
            </div>

            {/* Tables */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
               <div style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '20px', overflow: 'hidden' }}>
                  <div style={{ padding: '15px 24px', backgroundColor: '#f5f3f0', borderBottom: '1px solid #bfc8c7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#3f4947', textTransform: 'uppercase' }}>Nómina y Personal</h4>
                     <span style={{ fontWeight: 800, color: '#0f5551' }}>{formatUSD(620)}</span>
                  </div>
                  <Table items={[
                    { name: 'Vigilante Diurno/Nocturno', price: formatUSD(450) },
                    { name: 'Jardinero', price: formatUSD(60) },
                    { name: 'Servicio de Limpieza', price: formatUSD(40) },
                    { name: 'Bonos Alimentación', price: formatUSD(70) }
                  ]} />
               </div>
            </div>
          </div>
        ) : (
          <div id="users-view">
             <section style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <p style={{ fontSize: '12px', fontWeight: 700, color: '#785919', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 5px 0' }}>Comunidad</p>
                   <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: '32px', color: '#1B1C1A', margin: 0 }}>Gestión de Usuarios</h2>
                </div>
                <button
                  onClick={createVigilante}
                  style={{ backgroundColor: '#0f5551', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Crear Vigilante
                </button>
             </section>

             <div style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '20px', overflowX: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                   <thead style={{ backgroundColor: '#f5f3f0', borderBottom: '1px solid #bfc8c7' }}>
                      <tr>
                         <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6f7978', textTransform: 'uppercase' }}>Usuario</th>
                         <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6f7978', textTransform: 'uppercase' }}>Rol / Junta</th>
                         <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6f7978', textTransform: 'uppercase' }}>Estado</th>
                         <th style={{ padding: '15px 20px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#6f7978', textTransform: 'uppercase' }}>Acciones</th>
                      </tr>
                   </thead>
                   <tbody>
                      {users.map(u => (
                        <UserRow
                          key={u.id}
                          name={u.name}
                          email={u.email}
                          role={u.role}
                          status={u.status}
                          onValidate={u.status === 'Pendiente' ? () => validateUser(u.id) : undefined}
                          onStatusChange={() => toggleUserStatus(u.id)}
                          onDelete={() => deleteUser(u.id, u.name)}
                          onRoleChange={(r: string) => changeRole(u.id, r)}
                        />
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}
      </main>

      {/* Hidden printable report */}
      <div id="printable-report" style={{ display: 'none' }}>
        <div style={{ padding: '40px', backgroundColor: 'white', color: '#1B1C1A' }}>
          <h1 style={{ color: '#0f5551', borderBottom: '2px solid #0f5551', paddingBottom: '10px', fontSize: '24px' }}>CAMINOS DE LA LAGUNITA</h1>
          <h2 style={{ fontSize: '20px', marginTop: '20px' }}>Reporte Financiero - Junio 2026</h2>
          <div style={{ marginTop: '20px', border: '1px solid #bfc8c7', padding: '20px', borderRadius: '10px' }}>
            <p style={{ margin: '10px 0' }}><strong>Ingresos Totales:</strong> {formatUSD(1240)} ({formatBs(1240)})</p>
            <p style={{ margin: '10px 0' }}><strong>Gastos Totales:</strong> {formatUSD(985.40)} ({formatBs(985.40)})</p>
            <p style={{ margin: '10px 0', fontSize: '20px', color: '#0f5551' }}><strong>Saldo en Caja:</strong> {formatUSD(254.60)}</p>
          </div>
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ fontSize: '16px', borderBottom: '1px solid #bfc8c7', paddingBottom: '5px' }}>Desglose de Gastos</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}><span>Nómina y Personal</span><span>$620.00</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}><span>Servicios Públicos</span><span>$145.00</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}><span>Mantenimiento</span><span>$220.40</span></div>
          </div>
          <p style={{ marginTop: '50px', fontSize: '10px', color: '#6f7978', textAlign: 'center' }}>Este es un reporte institucional generado automáticamente el {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '85px',
        backgroundColor: 'white',
        borderTop: '2px solid #bfc8c7',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        alignItems: 'center',
        zIndex: 1000,
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 15px rgba(0,0,0,0.08)'
      }}>
        <NavIcon icon="home" label="Inicio" onClick={() => navigate('/dashboard')} />
        <NavIcon icon="rebase_edit" label="Solicitudes" />
        <NavIcon icon="account_balance_wallet" label="Finanzas" active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} />
        <NavIcon icon="group" label="Usuarios" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
        <NavIcon icon="person" label="Perfil" onClick={() => navigate('/profile')} />
      </nav>
    </div>
  )
}

const UserRow = ({ name, email, role, status, onValidate, onStatusChange, onDelete, onRoleChange }: any) => (
  <tr style={{ borderBottom: '1px solid #efeeeb' }}>
    <td style={{ padding: '15px 20px' }}>
       <div style={{ fontWeight: 600, fontSize: '14px', color: '#1B1C1A' }}>{name}</div>
       <div style={{ fontSize: '12px', color: '#6f7978' }}>{email}</div>
    </td>
    <td style={{ padding: '15px 20px' }}>
       <select
          defaultValue={role}
          onChange={(e) => onRoleChange(e.target.value)}
          style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '5px 10px',
            borderRadius: '6px',
            backgroundColor: '#f5f3f0',
            border: '1px solid #bfc8c7',
            outline: 'none',
            color: '#0f5551',
            cursor: 'pointer'
          }}
       >
          <option value="Propietario">PROPIETARIO</option>
          <option value="Administrador">ADMINISTRADOR</option>
          <option value="Tesorero">TESORERO</option>
          <option value="Secretario">SECRETARIO</option>
          <option value="Vigilante">VIGILANTE</option>
       </select>
    </td>
    <td style={{ padding: '15px 20px' }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: status === 'Validado' || status === 'Activo' ? '#0f5551' : '#785919' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: status === 'Validado' || status === 'Activo' ? '#0f5551' : '#785919' }}></div>
          {status.toUpperCase()}
       </div>
    </td>
    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
       <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {onValidate && (
            <button onClick={onValidate} style={{ backgroundColor: '#0f5551', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 4px rgba(15,85,81,0.2)' }}>
              VALIDAR
            </button>
          )}
          <button onClick={onStatusChange} title="Desactivar" style={{ background: 'none', border: '1px solid #bfc8c7', color: '#6f7978', padding: '4px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_off</span>
          </button>
          <button onClick={onDelete} title="Eliminar" style={{ background: 'none', border: '1px solid #ffdad6', color: '#ba1a1a', padding: '4px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
          </button>
       </div>
    </td>
  </tr>
)

const StatCard = ({ title, amount, sub, color, trend, icon }: any) => (
  <div style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
    <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 700, color: '#6f7978' }}>{title.toUpperCase()}</p>
    <h3 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: 700, color: color }}>{amount}</h3>
    <p style={{ margin: 0, fontSize: '13px', color: '#6f7978' }}>{sub}</p>
    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
       <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#6f7978', width: '16px', height: '16px' }}>{icon}</span>
       <span style={{ fontSize: '10px', fontWeight: 700, color: '#6f7978' }}>{trend.toUpperCase()}</span>
    </div>
  </div>
)

const Table = ({ items }: any) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <tbody>
      {items.map((it: any, i: number) => (
        <tr key={i} style={{ borderBottom: i === items.length - 1 ? 'none' : '1px solid #efeeeb' }}>
          <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 500 }}>{it.name}</td>
          <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: 800 }}>{it.price}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

const NavIcon = ({ icon, label, active, onClick }: any) => (
  <div onClick={onClick} style={{
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    color: active ? '#0f5551' : '#6f7978',
    height: '100%',
    transition: 'all 0.3s ease',
    overflow: 'hidden'
  }}>
    <div style={{
      backgroundColor: active ? '#e0f2f1' : 'transparent',
      padding: '4px 12px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '40px'
    }}>
      <span className="material-symbols-outlined" style={{
        fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
        fontSize: '22px'
      }}>{icon}</span>
    </div>
    <span className="nav-label" style={{
      fontSize: '11px',
      fontWeight: active ? 700 : 500,
      marginTop: '2px',
      textAlign: 'center',
      whiteSpace: 'nowrap'
    }}>{label}</span>
  </div>
)
