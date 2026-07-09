import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { formatBs, formatUSD } from '../../utils/currency'
import { useCurrencyStore } from '../../store/useCurrencyStore'
import { useCommunityStore, Poll } from '../../store/useCommunityStore'
import { supabase } from '../../lib/supabase'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import logoPremium from '../../assets/logo_premium.png'

const TabItem = ({ active, label, icon, onClick }: any) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 14px',
      borderRadius: '20px',
      border: 'none',
      backgroundColor: active ? 'var(--primary-color)' : 'var(--card-bg)',
      color: active ? 'white' : 'var(--text-sub)',
      fontSize: '12px',
      fontWeight: 700,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    }}
  >
    <span className="material-symbols-outlined" style={{ fontSize: '18px', width: 'auto', height: 'auto', overflow: 'visible' }}>{icon}</span>
    {label}
  </button>
)

export const Admin: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, setWhitelist } = useAuthStore()
  const bcvRate = useCurrencyStore(state => state.bcvRate)
  const { addPoll } = useCommunityStore()

  const initialTab = (searchParams.get('tab') as any) || 'finance'
  const [activeTab, setActiveTab] = useState<'finance' | 'users' | 'payments' | 'polls' | 'security'>(initialTab)

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['finance', 'users', 'payments', 'polls', 'security'].includes(tab)) {
      setActiveTab(tab as any)
    }
  }, [searchParams])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as any)
    setSearchParams({ tab })
  }
  const [sedematData, setSedematData] = useState<{ aseoBs: number, gasBs: number, aseoUsd: number, gasUsd: number } | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [isImportDebtsOpen, setIsImportDebtsOpen] = useState(false)
  const [pendingUsers, setPendingUsers] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Condo Settings State
  const [condoSettings, setCondoSettings] = useState({
    cuota_mensual_usd: 25,
    monto_pronto_pago_usd: 20,
    dias_pronto_pago: 5
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Poll state
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: '1',
      title: 'Cambio de Bomba de Agua',
      description: 'Se requiere la aprobación de la comunidad para la adquisición e instalación de una nueva bomba de agua de 5HP. Cuota extra por unidad: $25.00. Este cambio es crítico para garantizar el suministro constante.',
      priority: 'Alta',
      endDate: '30/11/2023',
      totalVotes: 97,
      votedHouses: [],
      options: [{ text: 'A FAVOR', votes: 85 }, { text: 'EN CONTRA', votes: 12 }]
    }
  ])

  // Financial State
  const [showGastoDetail, setShowGastoDetail] = useState(false)
  const [gastoDetail, setGastoDetail] = useState({ concepto: '', monto: 0, categoria: 'Servicios' })
  const [financialState, setFinancialState] = useState({
    condominio: "CONDOMINIO CAMINOS DE LA LAGUNITA",
    rif: "J-29900732-3",
    mes_relacion: "",
    gastos_ordinarios: [],
    gastos_sobrevenidos: []
  })

  // Modal Gasto State
  const [isGastoModalOpen, setIsGastoModalOpen] = useState(false)
  const [newGasto, setNewGasto] = useState({ concepto: '', monto_bs: '', type: 'ordinario' as 'ordinario' | 'sobrevenido' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch Users
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (userError) throw userError
      setUsers(userData.filter(u => u.status === 'active' || !u.status))
      setPendingUsers(userData.filter(u => u.status === 'pending'))

      // Fetch Payments
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .select('*, profiles(first_name, last_name, house_number)')
        .order('created_at', { ascending: false })

      if (paymentError) throw paymentError
      setPayments(paymentData)

      // Fetch Condo Settings
      const { data: settingsData } = await supabase
        .from('condo_settings')
        .select('*')
        .eq('id', 1)
        .single()

      if (settingsData) {
        setCondoSettings({
          cuota_mensual_usd: settingsData.cuota_mensual_usd,
          monto_pronto_pago_usd: settingsData.monto_pronto_pago_usd,
          dias_pronto_pago: settingsData.dias_pronto_pago
        })
      }

    } catch (err: any) {
      console.error('Error fetching admin data:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', userId)

      if (error) throw error
      alert('Usuario aprobado con éxito')
      fetchData()
    } catch (err: any) {
      alert('Error al aprobar usuario: ' + err.message)
    }
  }

  const validatePayment = async (paymentId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status })
        .eq('id', paymentId)

      if (error) throw error
      alert(`Pago ${status === 'approved' ? 'aprobado' : 'rechazado'} con éxito`)
      fetchData()
    } catch (err: any) {
      alert('Error al validar pago: ' + err.message)
    }
  }

  const saveCondoSettings = async () => {
    setIsSavingSettings(true)
    try {
      const { error } = await supabase
        .from('condo_settings')
        .upsert({
          id: 1,
          cuota_mensual_usd: condoSettings.cuota_mensual_usd,
          monto_pronto_pago_usd: condoSettings.monto_pronto_pago_usd,
          dias_pronto_pago: condoSettings.dias_pronto_pago,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      alert('Configuración guardada exitosamente')
    } catch (err: any) {
      alert('Error al guardar configuración: ' + err.message)
    } finally {
      setIsSavingSettings(false)
    }
  }

  const miniBtnStyle = { background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-sub)', padding: '6px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }

  const financialData = {
    condominio: "CONDOMINIO CAMINOS DE LA LAGUNITA",
    rif: "J-29900732-3",
    mes_relacion: new Date().toLocaleDateString('es-VE', { month: 'long', year: 'numeric' }).toUpperCase(),
    tasa_cambio: bcvRate,
    gastos_ordinarios: [] as any[],
    gastos_sobrevenidos: [] as any[]
  }

  // Poll state
  const [newPollTitle, setNewPollTitle] = useState('')
  const [newPollAmount, setNewPollAmount] = useState('')
  const [newPollDesc, setNewPollDesc] = useState('')
  const [opt1, setOpt1] = useState('')
  const [opt2, setOpt2] = useState('')

  const handleCreatePoll = () => {
    if (!newPollTitle || !newPollDesc || !opt1 || !opt2) return alert('Por favor, complete todos los campos.')
    const poll: Poll = {
      id: Date.now().toString(),
      title: newPollTitle,
      description: `${newPollDesc}${newPollAmount ? `\n\nMONTO ESTIMADO: ${formatUSD(parseFloat(newPollAmount))}` : ''}`,
      priority: 'Alta',
      endDate: 'Cierra en 3 días',
      totalVotes: 0,
      votedHouses: [],
      options: [{ text: opt1, votes: 0 }, { text: opt2, votes: 0 }]
    }
    setPolls([poll, ...polls]) // Usar el estado local de polls
    addPoll(poll)
    alert('¡Votación publicada exitosamente!')
    setNewPollTitle(''); setNewPollAmount(''); setNewPollDesc(''); setOpt1(''); setOpt2('');
  }

  const handleProcessSedemat = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      alert(`Archivo ${fileName} detectado.`);

      // Simulación de extracción de datos del recibo
      setTimeout(() => {
        const aseoBs = 240915.64;
        const gasBs = 90343.36;
        const aseoUsd = aseoBs / bcvRate;
        const gasUsd = gasBs / bcvRate;

        setSedematData({ aseoBs, gasBs, aseoUsd, gasUsd });
        setGastoDetail({ concepto: 'PAGO SERVICIOS MUNICIPALES', monto: aseoUsd + gasUsd, categoria: 'Impuestos/Servicios' });
        setShowGastoDetail(true);
      }, 1000);
    }
  }

  const handleImportDebts = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        setLoading(true);
        // Ajustar la URL según el entorno (dev/prod)
        const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

        const response = await fetch(`${API_BASE}/api/v1/accounting/migrate-excel`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Error en el servidor');
        }

        const result = await response.json();
        alert(`¡Migración Completada!\nProcesados: ${result.processed} registros.`);
        console.table(result.details);
        fetchData();
      } catch (err: any) {
        console.error('Error migrating debts:', err);
        alert('Error al migrar deudas: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  }

  const toggleConvenio = (userId: number) => {
    setUsers(users.map(u => u.id === userId ? { ...u, hasConvenio: !u.hasConvenio } : u));
    alert("Estado de convenio actualizado para el propietario.");
  }

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Header Info
    const header = [
      [financialData.condominio],
      [`RIF: ${financialData.rif}`],
      [`RELACIÓN DE GASTOS - ${financialData.mes_relacion}`],
      [`TASA BCV: ${bcvRate.toFixed(2)} Bs/$`],
      []
    ];

    // Ordinarios
    const ordinariosRows = [
      ["GASTOS ORDINARIOS"],
      ["CONCEPTO", "MONTO BS", "MONTO USD"],
      ...financialData.gastos_ordinarios.map(g => [g.concepto, g.bs, g.usd])
    ];

    // Sobrevenidos
    const sobrevenidosRows = [
      [],
      ["GASTOS SOBREVENIDOS"],
      ["CONCEPTO", "MONTO BS", "MONTO USD"],
      ...financialData.gastos_sobrevenidos.map(g => [g.concepto, g.bs, g.usd])
    ];

    // SEDEMAT if exists
    let sedematRows: any[] = [];
    if (sedematData) {
      sedematRows = [
        [],
        ["DETALLE COMPROBANTE DE PAGO (SEDEMAT)"],
        ["CONCEPTO", "MONTO BS", "MONTO USD"],
        ["Servicio de Aseo", sedematData.aseoBs, sedematData.aseoUsd],
        ["Servicio de Gas", sedematData.gasBs, sedematData.gasUsd],
        ["TOTAL MUNICIPAL", sedematData.aseoBs + sedematData.gasBs, sedematData.aseoUsd + sedematData.gasUsd]
      ];
    }

    const wsData = [...header, ...ordinariosRows, ...sobrevenidosRows, ...sedematRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Apply some basic column widths
    ws['!cols'] = [{ wch: 40 }, { wch: 20 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(wb, ws, "Relacion Mensual");
    XLSX.writeFile(wb, `Relacion_${financialData.mes_relacion.replace(' ', '_')}.xlsx`);
  }

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Relación de Gastos - ${financialData.mes_relacion}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; }
            .header { text-align: center; margin-bottom: 30px; }
            h1 { font-size: 22px; margin-bottom: 5px; }
            h2 { font-size: 16px; margin-top: 20px; border-bottom: 1px solid #000; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f2f2f2; }
            .monto { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin-bottom: 2px;">${financialData.condominio}</h1>
            <h2 style="margin-top: 0; border: none; font-size: 14px; margin-bottom: 10px;">RIF: ${financialData.rif}</h2>
            <p style="margin: 5px 0; font-weight: bold; letter-spacing: 1px;">RELACIÓN DE GASTOS Y CUOTAS DE MANTENIMIENTO</p>
            <p style="margin: 5px 0;">MES: ${financialData.mes_relacion} | TASA BCV: ${bcvRate.toFixed(2)} Bs/$</p>
          </div>

          <h2 style="font-size: 16px; margin-top: 20px; border-bottom: 1px solid #000; padding-bottom: 5px;">GASTOS ORDINARIOS</h2>
          <table>
            <thead><tr><th>CONCEPTO</th><th class="monto">MONTO BS</th><th class="monto">MONTO USD</th></tr></thead>
            <tbody>
              ${financialData.gastos_ordinarios.map(g => `<tr><td>${g.concepto}</td><td class="monto">${g.bs.toLocaleString('es-VE', {minimumFractionDigits: 2})}</td><td class="monto">$${g.usd.toFixed(2)}</td></tr>`).join('')}
            </tbody>
          </table>

          <h2>GASTOS SOBREVENIDOS</h2>
          <table>
            <thead><tr><th>CONCEPTO</th><th class="monto">MONTO BS</th><th class="monto">MONTO USD</th></tr></thead>
            <tbody>
              ${financialData.gastos_sobrevenidos.map(g => `<tr><td>${g.concepto}</td><td class="monto">${g.bs.toLocaleString('es-VE', {minimumFractionDigits: 2})}</td><td class="monto">$${g.usd.toFixed(2)}</td></tr>`).join('')}
            </tbody>
          </table>

          ${sedematData ? `
            <div style="margin-top: 30px; border: 1px solid #000; padding: 15px;">
              <h2 style="margin-top: 0; border: none;">DETALLE RECIBO SEDEMAT (PROCESADO)</h2>
              <p style="font-size: 11px;">Monto Aseo: ${sedematData.aseoBs.toLocaleString('es-VE')} Bs. ($${sedematData.aseoUsd.toFixed(2)})</p>
              <p style="font-size: 11px;">Monto Gas: ${sedematData.gasBs.toLocaleString('es-VE')} Bs. ($${sedematData.gasUsd.toFixed(2)})</p>
              <p style="font-size: 12px; font-weight: bold; margin-top: 10px;">TOTAL SERVICIOS MUNICIPALES: ${(sedematData.aseoBs + sedematData.gasBs).toLocaleString('es-VE')} Bs. ($${(sedematData.aseoUsd + sedematData.gasUsd).toFixed(2)})</p>
            </div>
          ` : ''}
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  }


  const handleImportResidents = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // El archivo tiene encabezados en la fila 4 (índice 3)
        // Usamos sheet_to_json con range: 4 para empezar a leer desde los datos (fila 5)
        // o range: 3 para leer desde los encabezados.
        const rawData: any[] = XLSX.utils.sheet_to_json(ws, { range: 3 });

        const mappedUsers = rawData.map((row: any, index: number) => ({
          id: Date.now() + index,
          name: `${row['NOMBRE'] || ''} ${row['APELLIDO'] || ''}`.trim(),
          email: (row['CORREO'] || '').toLowerCase().trim(),
          role: row['USUARIO'] === 'ADMINISTRADOR' ? 'Administrador' : 'Residente',
          house_number: row['CASA N°'],
          status: "Activo",
          phone: "",
          debt: 0,
          password: row['CONTRASEÑA']
        })).filter(u => u.email);

        setUsers(prev => [...prev, ...mappedUsers]);
        setWhitelist(mappedUsers);
        alert(`¡Éxito! Se han importado ${mappedUsers.length} registros del archivo ${file.name}.`);
      };
      reader.readAsBinaryString(file);
    }
  }

  const generateStatementPDF = (resident: any) => {
    const doc = new jsPDF()

    // Configuración de estilos imitando la referencia
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("CONDOMINIO CONJUNTO 14 LAS HUERTAS", 10, 15)
    doc.text("RIF. J-29900732-3", 10, 20)
    doc.text(`Fecha:  ${new Date().toLocaleDateString('es-VE')}`, 150, 20)

    doc.text("ESTADO DE CUENTA HASTA 31/05/2026", 10, 30)
    doc.line(10, 32, 200, 32)

    doc.text(`PROPIETARIO: ${resident.name.toUpperCase()}`, 10, 40)
    doc.text(`CASA: ${resident.house_number}`, 120, 40)

    // Tabla de movimientos (Simulada según la imagen)
    autoTable(doc, {
      startY: 45,
      head: [['DESCRIPCIÓN', 'MONTO $']],
      body: [
        ['** MÁS SALDO PENDIENTE DE LA JUNTA ANTERIOR', '445,00 $'],
        ['- ABONA EL 19-06-2023 BS. 271,70 SON 10,00 DOLARES', '-10,00 $'],
        ['SALDO PENDIENTE HASTA EL 30-06-2023', '435,00 $'],
        ['- ABONA EL 01-07-2023 BS. 270,50 SON 10,00 DOLARES', '-10,00 $'],
        ['** MAS CUOTAS DESDE JUNIO HASTA DICIEMBRE 2024 (7 MESES X 20$)', '140,00 $'],
        ['** MAS CUOTAS ENERO - MAYO 2026', '120,00 $'],
        ['SALDO PENDIENTE HASTA EL 31/05/2026', `${resident.debt.toFixed(2).replace('.', ',')} $`],
      ],
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2, font: 'helvetica' },
      headStyles: { fontStyle: 'bold', textColor: [0, 0, 0], fillColor: [240, 240, 240] },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
    })

    const finalY = (doc as any).lastAutoTable.finalY || 150
    doc.setFontSize(10)
    doc.text("Realizado por:", 10, finalY + 15)
    doc.text("Lcda. Maria Eugenia Urbina", 10, finalY + 22)
    doc.text("Administradora", 10, finalY + 27)

    const fileName = `Estado_de_Cuenta_casa_${resident.house_number}_año_2026.pdf`
    doc.save(fileName)
    return fileName
  }

  const sendWhatsApp = (resident: any) => {
    const message = `Hola ${resident.name}, te adjunto tu Estado de Cuenta de la casa ${resident.house_number}. Saldo pendiente: ${resident.debt}$ a la fecha.`
    const url = `https://wa.me/${resident.phone.replace('+', '')}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const deleteUser = (id: number, name: string) => {
    if (window.confirm(`¿Está seguro de que desea eliminar a ${name}?`)) {
      setUsers(users.filter(u => u.id !== id));
    }
  }

  const addUser = () => {
    const name = prompt("Nombre completo:");
    const email = prompt("Correo:");
    const role = prompt("Rol (Residente, Tesorero, Administrador, Vigilante):");
    if (name && email && role) {
      setUsers([...users, {
        id: Date.now(),
        name,
        email,
        role,
        status: "Activo",
        phone: "",
        house_number: "",
        debt: 0
      }]);
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '40px', paddingTop: '20px' }}>

      {/* Tabs Selector Contextual */}
      {(activeTab === 'finance' || activeTab === 'polls') && (
        <div style={{ display: 'flex', width: '100%', gap: '10px', padding: '0 20px 25px', marginBottom: '10px', justifyContent: 'center' }}>
          <TabItem active={activeTab === 'finance'} label="Finanzas" icon="finance" onClick={() => handleTabChange('finance')} />
          <TabItem active={activeTab === 'polls'} label="Votos" icon="how_to_vote" onClick={() => handleTabChange('polls')} />
        </div>
      )}

      <main style={mainContentStyle}>

        {activeTab === 'finance' && (
          <section style={{ width: '100%' }}>
             <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '32px', fontFamily: "'EB Garamond', serif", margin: '0 0 10px 0' }}>Relación Mensual</h3>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                   {/* Escrito más largo centrado arriba */}
                   <input type="file" id="sedemat-file" style={{ display: 'none' }} accept=".pdf" onChange={handleProcessSedemat} />
                   <button onClick={() => document.getElementById('sedemat-file')?.click()} style={{ ...actionBtnStyle, width: 'fit-content', backgroundColor: sedematData ? 'rgba(37, 211, 102, 0.1)' : 'var(--card-bg)' }}>
                      <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>upload_file</span>
                      {sedematData ? 'COMPROBANTE CARGADO' : 'SUBIR COMPROBANTE DE PAGO'}
                   </button>

                   {/* Otros botones debajo */}
                   <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button onClick={() => { setGastoDetail({ concepto: '', monto: 0, categoria: 'Reparación' }); setShowGastoDetail(true); }} style={actionBtnStyle}>
                         <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>add_circle</span> Nuevo Gasto
                      </button>
                      <button onClick={handleExportPDF} style={actionBtnStyle}>
                         <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>picture_as_pdf</span> PDF
                      </button>
                      <button onClick={handleExportExcel} style={actionBtnStyle}>
                         <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>table_view</span> Excel
                      </button>
                   </div>
                </div>
             </div>
             <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '15px' }}>
                   <span style={{ fontWeight: 700 }}>{financialData.condominio}</span>
                   <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>BCV: {bcvRate.toFixed(2)}</span>
                </div>

                {sedematData && (
                  <div style={{ backgroundColor: 'rgba(15, 85, 81, 0.05)', padding: '15px', borderRadius: '15px', marginBottom: '15px', border: '1px dashed var(--primary-color)' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '10px', fontWeight: 800, color: 'var(--primary-color)' }}>MUNICIPAL (SEDEMAT)</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '13px' }}>Aseo Urbano</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{formatUSD(sedematData.aseoUsd)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px' }}>Gas Doméstico</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{formatUSD(sedematData.gasUsd)}</span>
                    </div>
                  </div>
                )}

                {showGastoDetail && (
                  <div style={{ backgroundColor: 'var(--icon-bg)', padding: '20px', borderRadius: '15px', marginBottom: '15px', border: '1px solid var(--border-color)' }}>
                    <p style={labelStyle}>Registro de Gasto Detallado</p>
                    <input
                      style={{ ...inputStyle, padding: '10px', fontSize: '13px', marginBottom: '8px' }}
                      value={gastoDetail.concepto}
                      onChange={e => setGastoDetail({ ...gastoDetail, concepto: e.target.value })}
                      placeholder="Concepto del gasto"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input
                        type="text"
                        inputMode="decimal"
                        style={{ ...inputStyle, padding: '10px', fontSize: '13px' }}
                        value={gastoDetail.monto}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9.]/g, '');
                          setGastoDetail({ ...gastoDetail, monto: parseFloat(val) || 0 });
                        }}
                        placeholder="Monto $"
                      />
                      <button
                        onClick={() => {
                          alert("Gasto registrado en el libro diario contable.");
                          setShowGastoDetail(false);
                        }}
                        style={{ ...primaryBtnStyleSmall, width: '100%', fontSize: '13px', justifyContent: 'center', padding: '14px' }}
                      >
                        GUARDAR GASTO
                      </button>
                    </div>
                  </div>
                )}

                {financialData.gastos_ordinarios.slice(0, 5).map((g, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--icon-bg)' }}>
                     <span style={{ fontSize: '14px', color: 'var(--text-sub)' }}>{g.concepto}</span>
                     <span style={{ fontWeight: 700 }}>{formatUSD(g.usd)}</span>
                  </div>
                ))}

                <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '2px dashed var(--border-color)' }}>
                   <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-sub)', marginBottom: '15px', letterSpacing: '1px' }}>GESTIÓN DE PERSONAL</p>
                   <button onClick={() => navigate('/admin/payroll')} style={{ ...primaryBtnStyleSmall, width: '100%', justifyContent: 'center', backgroundColor: 'var(--primary-color)', marginBottom: '20px' }}>
                      <span className="material-symbols-outlined">payments</span>
                      <span>GESTIONAR NÓMINA DE EMPLEADOS</span>
                   </button>

                   <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '15px', letterSpacing: '1px', marginTop: '10px' }}>CONFIGURACIÓN DE CUOTAS</p>
                   <div style={{ ...cardStyle, padding: '20px', backgroundColor: 'rgba(198, 160, 89, 0.05)', border: '1px solid var(--accent-gold)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                         <div>
                            <label style={labelStyle}>CUOTA MENSUAL ($)</label>
                            <input
                              type="number"
                              style={inputStyle}
                              value={condoSettings.cuota_mensual_usd}
                              onChange={e => setCondoSettings({...condoSettings, cuota_mensual_usd: parseFloat(e.target.value)})}
                            />
                         </div>
                         <div>
                            <label style={labelStyle}>PRONTO PAGO ($)</label>
                            <input
                              type="number"
                              style={inputStyle}
                              value={condoSettings.monto_pronto_pago_usd}
                              onChange={e => setCondoSettings({...condoSettings, monto_pronto_pago_usd: parseFloat(e.target.value)})}
                            />
                         </div>
                      </div>
                      <div style={{ marginBottom: '20px' }}>
                         <label style={labelStyle}>DÍAS LÍMITE PRONTO PAGO (HASTA EL DÍA...)</label>
                         <input
                           type="number"
                           style={inputStyle}
                           value={condoSettings.dias_pronto_pago}
                           onChange={e => setCondoSettings({...condoSettings, dias_pronto_pago: parseInt(e.target.value)})}
                         />
                      </div>
                      <button
                        onClick={saveCondoSettings}
                        disabled={isSavingSettings}
                        style={{ ...primaryBtnStyleSmall, width: '100%', justifyContent: 'center', backgroundColor: 'var(--accent-gold)' }}
                      >
                         <span className="material-symbols-outlined">save</span>
                         <span>{isSavingSettings ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN'}</span>
                      </button>
                   </div>
                </div>
             </div>
          </section>
        )}

        {activeTab === 'users' && (
          <section style={{ width: '100%' }}>
             <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '32px', fontFamily: "'EB Garamond', serif", margin: '0 0 10px 0' }}>Gestión de Usuarios</h3>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button onClick={addUser} style={primaryBtnStyleSmall}>
                     <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                     <span>Añadir</span>
                  </button>
                  <input type="file" id="import-residents" style={{ display: 'none' }} accept=".xlsx, .xls" onChange={handleImportResidents} />
                  <button onClick={() => document.getElementById('import-residents')?.click()} style={{ ...primaryBtnStyleSmall, backgroundColor: 'var(--accent-gold)' }}>
                     <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload_file</span>
                     <span>Importar Residentes</span>
                  </button>
                  <input type="file" id="import-debts" style={{ display: 'none' }} accept=".xlsx, .xls" onChange={handleImportDebts} />
                  <button onClick={() => document.getElementById('import-debts')?.click()} style={{ ...primaryBtnStyleSmall, backgroundColor: '#0f5551' }}>
                     <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>history</span>
                     <span>Migrar Deudas</span>
                  </button>
                </div>
             </div>

             {pendingUsers.length > 0 && (
               <div style={{ marginBottom: '30px' }}>
                 <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '15px', letterSpacing: '1px' }}>SOLICITUDES PENDIENTES ({pendingUsers.length})</p>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {pendingUsers.map(u => (
                      <div key={u.id} style={{ ...cardStyle, padding: '15px 20px', border: '1px solid var(--accent-gold)' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                               <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(198, 160, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <span className="material-symbols-outlined" style={{ color: 'var(--accent-gold)' }}>person_search</span>
                               </div>
                               <div>
                                  <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>{u.first_name} {u.last_name}</p>
                                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-sub)' }}>Casa {u.house_number} • {u.residential_cluster}</p>
                               </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                               <button onClick={() => approveUser(u.id)} style={{ ...miniBtnStyle, backgroundColor: 'var(--primary-color)', color: 'white', border: 'none' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
                               </button>
                               <button onClick={() => deleteUser(u.id, u.first_name)} style={{ ...miniBtnStyle, color: '#ba1a1a' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                               </button>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
               </div>
             )}

             <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)', marginBottom: '15px', letterSpacing: '1px' }}>USUARIOS ACTIVOS</p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {users.map(u => (
                  <div key={u.id} style={{ ...cardStyle, padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--icon-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <span className="material-symbols-outlined" style={{ color: 'var(--primary-color)' }}>person</span>
                        </div>
                        <div>
                           <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>{u.first_name || u.name} {u.last_name || ''}</p>
                           <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-sub)' }}>{u.role} • Casa {u.house_number || 'N/A'}</p>
                        </div>
                     </div>
                     <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => toggleConvenio(u.id)} style={{ ...miniBtnStyle, borderColor: u.hasConvenio ? 'var(--accent-gold)' : 'var(--border-color)', backgroundColor: u.hasConvenio ? 'rgba(120, 89, 25, 0.1)' : 'transparent' }} title="Convenio de Pago">
                           <span className="material-symbols-outlined" style={{ fontSize: '18px', color: u.hasConvenio ? 'var(--accent-gold)' : 'inherit' }}>handshake</span>
                        </button>
                        <button onClick={() => generateStatementPDF(u)} style={{ ...miniBtnStyle, borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }} title="Descargar PDF">
                           <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>picture_as_pdf</span>
                        </button>
                        <button onClick={() => deleteUser(u.id, u.name || u.first_name)} style={{ background: 'none', border: 'none', color: '#ba1a1a', cursor: 'pointer', padding: '8px' }}>
                           <span className="material-symbols-outlined">person_remove</span>
                        </button>
                     </div>
                  </div>
                ))}
             </div>
          </section>
        )}

        {activeTab === 'payments' && (
          <section style={{ width: '100%' }}>
             <h3 style={{ fontSize: '32px', fontFamily: "'EB Garamond', serif", textAlign: 'center', marginBottom: '30px' }}>Validación de Pagos</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {payments.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-sub)' }}>No hay pagos registrados para validar.</p>}
                {payments.map(p => (
                  <div key={p.id} style={cardStyle}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <div>
                           <p style={{ margin: 0, fontWeight: 700 }}>{p.profiles?.first_name} {p.profiles?.last_name}</p>
                           <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-sub)' }}>Casa {p.profiles?.house_number} • {new Date(p.created_at).toLocaleDateString()}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                           <p style={{ margin: 0, fontWeight: 800, color: 'var(--primary-color)' }}>{formatUSD(p.amount_usd || 0)}</p>
                           <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: p.status === 'pending' ? '#fff4e5' : p.status === 'approved' ? '#e6f4ea' : '#fce8e6', color: p.status === 'pending' ? '#b45d00' : p.status === 'approved' ? '#1e7e34' : '#c82333', fontWeight: 700 }}>
                              {p.status?.toUpperCase()}
                           </span>
                        </div>
                     </div>

                     {p.description && (
                        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: 'var(--icon-bg)', borderRadius: '10px', borderLeft: '4px solid var(--accent-gold)' }}>
                           <p style={{ margin: 0, fontSize: '12px', fontStyle: 'italic' }}>"{p.description}"</p>
                        </div>
                     )}

                     {p.screenshot_url && (
                        <div style={{ marginBottom: '15px' }}>
                           <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '8px' }}>COMPROBANTE:</p>
                           {p.screenshot_url.toLowerCase().endsWith('.pdf') ? (
                              <div
                                onClick={() => window.open(p.screenshot_url, '_blank')}
                                style={{ padding: '20px', backgroundColor: '#fde8e8', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', border: '1px solid #f8b4b4' }}
                              >
                                <span className="material-symbols-outlined" style={{ color: '#c82333', fontSize: '32px' }}>picture_as_pdf</span>
                                <div>
                                  <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#c82333' }}>Ver Comprobante PDF</p>
                                  <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>Haga clic para abrir en nueva pestaña</p>
                                </div>
                              </div>
                           ) : (
                              <img
                                 src={p.screenshot_url}
                                 alt="Comprobante"
                                 style={{ width: '100%', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
                                 onClick={() => window.open(p.screenshot_url, '_blank')}
                              />
                           )}
                        </div>
                     )}

                     {p.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                           <button onClick={() => validatePayment(p.id, 'approved')} style={{ ...primaryBtnStyle, padding: '12px', backgroundColor: '#1e7e34' }}>Aprobar Pago</button>
                           <button onClick={() => validatePayment(p.id, 'rejected')} style={{ ...primaryBtnStyle, padding: '12px', backgroundColor: '#c82333' }}>Rechazar</button>
                        </div>
                     )}
                  </div>
                ))}
             </div>
          </section>
        )}

        {activeTab === 'polls' && (
          <section style={{ width: '100%' }}>
             <h3 style={{ fontSize: '32px', fontFamily: "'EB Garamond', serif", textAlign: 'center', marginBottom: '30px' }}>Votaciones y Decisiones</h3>

             <div style={{ ...cardStyle, marginBottom: '30px' }}>
                <p style={labelStyle}>CREAR NUEVA PROPUESTA</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                   <div>
                      <label style={labelStyle}>Título</label>
                      <input value={newPollTitle} onChange={e => setNewPollTitle(e.target.value)} style={inputStyle} placeholder="Ej: Cambio Bomba" />
                   </div>
                   <div>
                      <label style={labelStyle}>Monto Estimado ($)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={newPollAmount}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9.]/g, '');
                          setNewPollAmount(val);
                        }}
                        style={inputStyle}
                        placeholder="0.00"
                      />
                   </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                   <label style={labelStyle}>Descripción</label>
                   <textarea value={newPollDesc} onChange={e => setNewPollDesc(e.target.value)} style={{ ...inputStyle, height: '100px' }} placeholder="Explique la necesidad del gasto..." />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                   <div><label style={labelStyle}>Opción 1</label><input value={opt1} onChange={e => setOpt1(e.target.value)} style={inputStyle} placeholder="A Favor" /></div>
                   <div><label style={labelStyle}>Opción 2</label><input value={opt2} onChange={e => setOpt2(e.target.value)} style={inputStyle} placeholder="En Contra" /></div>
                </div>
                <button onClick={handleCreatePoll} style={primaryBtnStyle}>Publicar Votación</button>
             </div>

             <p style={labelStyle}>VOTACIONES ACTIVAS / CERRADAS</p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {polls.map(p => (
                   <div key={p.id} style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                         <div>
                            <p style={{ margin: 0, fontWeight: 700 }}>{p.title}</p>
                            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-sub)' }}>Estatus: Activa • Cierra: {p.endDate}</p>
                         </div>
                         <button
                          onClick={() => {
                            if(window.confirm("¿Confirmas que deseas generar la deuda masiva por este concepto?")) {
                              alert("¡Éxito! Se ha generado la deuda masiva.");
                            }
                          }}
                          style={{ ...primaryBtnStyleSmall, backgroundColor: 'var(--accent-gold)' }}
                         >
                            Ejecutar Gasto
                         </button>
                      </div>
                      <div style={{ marginTop: '15px', display: 'flex', gap: '20px' }}>
                         {p.options.map((o, idx) => (
                           <div key={idx} style={{ textAlign: 'center' }}>
                              <p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: idx === 0 ? 'var(--primary-color)' : '#ba1a1a' }}>{o.votes}</p>
                              <p style={{ margin: 0, fontSize: '9px', fontWeight: 800 }}>{o.text}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                ))}
             </div>
          </section>
        )}
        {activeTab === 'security' && (
          <section style={{ width: '100%' }}>
             <h3 style={{ fontSize: '32px', fontFamily: "'EB Garamond', serif", textAlign: 'center', marginBottom: '30px' }}>Super Administrador</h3>

             <div style={cardStyle}>
                <p style={labelStyle}>CREAR NUEVO CONJUNTO / RESIDENCIA</p>
                <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginBottom: '20px' }}>Adjunte el archivo Excel con la base de datos de propietarios para inicializar un nuevo conjunto residencial.</p>

                <input type="file" id="super-import" style={{ display: 'none' }} accept=".xlsx, .xls" onChange={handleImportResidents} />
                <button
                  onClick={() => document.getElementById('super-import')?.click()}
                  style={{ ...primaryBtnStyle, backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                  <span className="material-symbols-outlined">add_business</span>
                  IMPORTAR EXCEL Y CREAR CONJUNTO
                </button>
             </div>

             <div style={{ ...cardStyle, marginTop: '20px' }}>
                <p style={labelStyle}>SEGURIDAD Y API KEYS</p>
                <input
                  placeholder="Nombre del cliente (Ej: n8n Reportes)"
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  style={{ ...inputStyle, marginBottom: '15px' }}
                />
                <button
                  onClick={async () => {
                    if(!newKeyName) return alert('Ingresa un nombre');
                    const fakeKey = 'condo_' + Math.random().toString(36).substring(2, 15);
                    setGeneratedKey(fakeKey);
                    setApiKeys([{ id: Date.now(), nombre_cliente: newKeyName, activo: true, fecha_creacion: new Date().toISOString() }, ...apiKeys]);
                    setNewKeyName('');
                  }}
                  style={{ ...primaryBtnStyle, backgroundColor: 'var(--accent-gold)' }}
                >
                  Generar Key de Integración
                </button>
             </div>
          </section>
        )}
      </main>
    </div>
  )
}

const mainContentStyle = { paddingLeft: '20px', paddingRight: '20px', width: '100%', maxWidth: '850px', margin: '0 auto', boxSizing: 'border-box' as any }
const actionBtnStyle = { backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--primary-color)', padding: '12px 20px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: '14px' }
const cardStyle = { backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '28px', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' as any, boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }
const primaryBtnStyleSmall = { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', width: 'fit-content' }
const inputStyle = { width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)', outline: 'none', fontSize: '16px' }
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '8px', letterSpacing: '0.5px' }
const primaryBtnStyle = { width: '100%', padding: '20px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 700, cursor: 'pointer', fontSize: '16px' }
