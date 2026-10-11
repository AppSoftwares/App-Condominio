export interface AnnouncementTemplateInput {
  tipo: 'general' | 'asamblea' | 'urgente' | 'mantenimiento' | 'finanzas'
  titulo: string
  fecha?: string
  hora?: string
  lugar?: string
  mensaje: string
  notaImportante?: string
  contacto?: string
}

export function buildAnnouncementText(input: AnnouncementTemplateInput): string {
  const { tipo, titulo, fecha, hora, lugar, mensaje, notaImportante, contacto } = input

  switch (tipo) {
    case 'asamblea':
      return `Estimados vecinos,

Se convoca formalmente a **${titulo}** que se llevará a cabo el día **${fecha || '[Fecha]'}** a las **${hora || '[Hora]'}** en **${lugar || 'Área común principal'}**.

${mensaje}

${notaImportante ? `> **Nota importante:** ${notaImportante}\n\n` : ''}${contacto ? `Para dudas o poder de representación, contactar a: ${contacto}\n\n` : ''}Atentamente,
La Administración`

    case 'mantenimiento':
      return `Estimados propietarios y residentes,

Informamos sobre trabajos de mantenimiento programados (${titulo}) para el día **${fecha || '[Fecha]'}** a partir de las **${hora || '[Hora]'}** (${lugar || 'Zonas comunes'}).

${mensaje}

${notaImportante ? `> ⚠️ **Aviso:** ${notaImportante}\n\n` : ''}${contacto ? `Dudas o reportes: ${contacto}\n\n` : ''}Agradecemos su comprensión y colaboración para mantener nuestros espacios óptimos.
La Administración`

    case 'urgente':
      return `🚨 **AVISO URGENTE: ${titulo.toUpperCase()}** 🚨

${mensaje}

${notaImportante ? `> **Acción requerida:** ${notaImportante}\n\n` : ''}${contacto ? `Emergencias / Contacto directo: ${contacto}\n\n` : ''}Atentamente,
La Administración y Seguridad`

    case 'finanzas':
      return `Estimada comunidad,

${titulo}

${mensaje}

${fecha ? `Fecha límite / Vencimiento: **${fecha}**\n` : ''}${lugar ? `Lugar o canal de recepción: ${lugar}\n` : ''}
${notaImportante ? `> 💡 **Nota financiera:** ${notaImportante}\n\n` : ''}${contacto ? `Para consultas de tesorería y pagos: ${contacto}\n\n` : ''}Atentamente,
Administración y Tesorería`

    case 'general':
    default:
      return `${mensaje}

${notaImportante ? `> ${notaImportante}\n\n` : ''}${contacto ? `Contacto: ${contacto}\n\n` : ''}Atentamente,
La Administración`
  }
}

export function buildPushPreview(input: AnnouncementTemplateInput): { title: string, body: string } {
  const prefixMap: Record<string, string> = {
    general: '📢',
    asamblea: '🏛️',
    urgente: '🚨',
    mantenimiento: '🔧',
    finanzas: '💳'
  }

  const icon = prefixMap[input.tipo] || '📢'
  const title = `${icon} ${input.titulo || 'Nuevo Comunicado'}`.slice(0, 50)

  let rawBody = input.mensaje
  if (input.fecha) rawBody = `[Fecha: ${input.fecha}] ${rawBody}`
  const body = rawBody.slice(0, 150)

  return { title, body }
}
