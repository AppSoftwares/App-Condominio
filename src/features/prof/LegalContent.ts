export interface LegalSection {
  title: string;
  body: string;
}

export const TERMS_AND_CONDITIONS = {
  title: "Términos y Condiciones de Servicio",
  lastUpdate: "09 de octubre de 2026",
  intro: `Los presentes Términos y Condiciones ("Términos") regulan el acceso y uso de la plataforma web y aplicación móvil App Condominio (en adelante, "la Plataforma" o "el Servicio"), operada por [CONFIRMAR razón social], RIF [CONFIRMAR RIF], con domicilio fiscal en [CONFIRMAR domicilio fiscal] (en adelante, "el Prestador").

Al crear una cuenta, ingresar o utilizar la Plataforma, el usuario manifiesta su conformidad absoluta con las disposiciones aquí establecidas. Si no está de acuerdo con estos Términos, deberá abstenerse de utilizar el Servicio.`,
  sections: [
    {
      title: "1. Descripción del Servicio",
      body: `App Condominio es una plataforma tecnológica bajo la modalidad SaaS (Software como Servicio) diseñada para optimizar la gestión operativa, financiera, de comunicación y de gobernanza de conjuntos residenciales, edificios y condominios en la República Bolivariana de Venezuela.
El Servicio comprende las siguientes funcionalidades principales:
• Gestión de la Estructura Residencial: Padrón de unidades, inmuebles, propietarios, arrendatarios y alícuotas correspondientes.
• Módulo Financiero y Recaudación: Carga de avisos de cobro, desglose de gastos comunes y extraordinarios, conciliación y validación de pagos.
• Gobernanza Digital: Herramientas para la convocatoria, consulta digital, emisión de votos, control de quórum y trazabilidad en asambleas.
• Control de Acceso y Visitantes: Registro de ingresos, control vehicular y gestión de pases de visitantes.
• Módulos Operativos: Reserva de áreas comunes, canalización de incidencias, cartelera virtual de avisos y repositorio documental.`
    },
    {
      title: "2. Registro de Cuentas y Responsabilidad de Credenciales",
      body: `1. Alta del Condominio: La activación de una comunidad requiere ser ejecutada por un representante legal legítimo, administrador autorizado o por el equipo técnico de App Condominio.
2. Uso Individual e Intransferible: Cada cuenta de usuario se vincula a una persona natural. Queda estrictamente prohibido compartir credenciales de acceso.
3. Custodia de Credenciales: El usuario es el único responsable de la confidencialidad de su contraseña y de las acciones realizadas desde su cuenta.
4. Veracidad de la Información: El usuario garantiza que la información suministrada es exacta, actualizada y veraz.`
    },
    {
      title: "3. Suscripción, Tarifas y Tasa de Cambio",
      body: `1. Planes de Suscripción: El costo del Servicio se calcula bajo una modalidad de suscripción periódica basada en el número de unidades o apartamentos que conforman el condominio.
2. Tasa de Cambio y Transparencia (§3.2): Las tarifas están expresadas en dólares estadounidenses (USD) como unidad de referencia. Las facturas y pagos procesados dentro del territorio venezolano se liquidarán en Bolívares (Bs.) calculados a la tasa de cambio oficial publicada por el Banco Central de Venezuela (BCV) vigente en la fecha de la transacción (fuente: DolarApi / BCV). El monto final en Bs. de las cuotas condominiales es validado y confirmado por la administración de tu condominio.
3. Período de Prueba (Trial): Se podrá otorgar un período de prueba gratuito de hasta treinta (30) días continuos.
4. Condiciones de Pago: La facturación se realiza de manera anticipada.
5. Ajuste de Precios: Se notificará con al menos treinta (30) días de anticipación.`
    },
    {
      title: "4. Uso Aceptable de la Plataforma",
      body: `El usuario se obliga a hacer un uso diligente, correcto y lícito de la Plataforma, prohibiéndose tajantemente la suplantación de identidad, difusión de contenido falso, ataques informáticos o ingeniería inversa.`
    },
    {
      title: "5. Propiedad de los Datos y Exportación",
      body: `1. Titularidad: Toda la información cargada es propiedad exclusiva del condominio o de los usuarios titulares.
2. Rol de la Plataforma: App Condominio opera en calidad de Encargado del Tratamiento.
3. Exportación y Retención: En caso de terminación del servicio, la administración dispondrá de treinta (30) días para exportar sus datos (formatos CSV/Excel) y se procederá a la purga a los sesenta (60) días.`
    },
    {
      title: "6. Propiedad Intelectual",
      body: `La Plataforma y sus componentes son propiedad intelectual exclusiva de App Condominio, protegidos bajo la legislación venezolana (SAPI).`
    },
    {
      title: "7. Disponibilidad y Nivel de Servicio (SLA)",
      body: `Se realizan esfuerzos razonables para mantener una disponibilidad operativa del 99.5% mensual, excluyendo fallas de proveedores ISP o servicios eléctricos.`
    },
    {
      title: "8. Limitación de Responsabilidad y Verificación de Pagos",
      body: `1. Verificación de Pagos: App Condominio no es entidad financiera ni gestora de fondos; la administración es la única responsable de validar los comprobantes de pago.
2. Decisiones Internas: La plataforma no responde por resoluciones de las Juntas de Condominio.
3. Límite de Indemnización (§8.3): En caso de comprobarse judicialmente responsabilidad directa por negligencia grave imputable a la Plataforma, la responsabilidad total máxima acumulada no excederá el monto equivalente pagado por el condominio contratante en los últimos tres (3) meses de servicio, conforme a la legislación aplicable de protección al consumidor.`
    },
    {
      title: "9. Cumplimiento Legal y Mensajes de Datos",
      body: `Las notificaciones y registros generados se amparan bajo la Ley sobre Mensajes de Datos y Firmas Electrónicas, sin menoscabo de la Ley de Propiedad Horizontal.`
    },
    {
      title: "10. Suspensión, Cancelación y Reembolsos",
      body: `La administración puede cancelar en cualquier momento con aviso previo de 30 días, sujetándose a la Política de Reembolso y Cancelación y al procedimiento de eliminación de datos.`
    },
    {
      title: "11. Modificaciones a los Términos",
      body: `Cualquier modificación sustancial requerirá de aceptación ACTIVA por parte del usuario en la aplicación (mediante ConsentGate), sin constituir aceptación tácita por el uso continuado.`
    },
    {
      title: "12. Ley Aplicable y Jurisdicción",
      body: `Estos Términos se rigen por las leyes de la República Bolivariana de Venezuela, sometiéndose a los tribunales competentes.`
    }
  ],
  footer: {
    contactEmail: "[CONFIRMAR correo corporativo]",
    webPortal: "https://app-condominio.vercel.app",
    location: "República Bolivariana de Venezuela",
    copy: "© 2026 App Condominio — Todos los derechos reservados."
  }
};

export const PRIVACY_POLICY = {
  title: "Política de Privacidad",
  lastUpdate: "09 de octubre de 2026",
  intro: `App Condominio ("nosotros", "nuestra plataforma"), operada por [CONFIRMAR razón social], RIF [CONFIRMAR RIF], con domicilio en [CONFIRMAR domicilio fiscal] y correo de privacidad [CONFIRMAR correo corporativo], describe en la presente Política de Privacidad cómo recopilamos, procesamos y protegemos la información personal.`,
  sections: [
    {
      title: "1. Naturaleza del Tratamiento de Datos",
      body: `La Junta de Condominio o la Empresa Administradora actúa como Responsable del Tratamiento. App Condominio actúa estrictamente como Encargado del Tratamiento.`
    },
    {
      title: "2. Información que Recopilamos",
      body: `• Datos de cuenta: Nombre, apellido, correo electrónico, teléfono y contraseña cifrada.
• Datos del inmueble: Conjunto residencial, RIF, dirección, unidad y alícuota.
• Información financiera: Estados de cuenta, historial de pagos y comprobantes.
• Control de accesos: Datos de visitantes, cédula, placa y hora de ingreso.
• Datos técnicos: IP, tipo de dispositivo, sistema operativo y notificaciones push.`
    },
    {
      title: "3. Garantía de Privacidad y No Comercialización",
      body: `No vendemos ni alquilamos datos personales. Solo los compartimos con los proveedores tecnológicos listados en la sección 4 que actúan como subencargados, y con la administración de tu condominio.`
    },
    {
      title: "4. Tabla de Subencargados y Terceros",
      body: `• Supabase: Base de datos, autenticación y almacenamiento de archivos. Ubicación: Londres / UE.
• Vercel: Hosting web de la plataforma. Ubicación: [CONFIRMAR región].
• Google Firebase Cloud Messaging: Gestión de notificaciones push (token de dispositivo).
• Google OAuth: Autenticación federada de inicio de sesión (opcional).
• Sentry: Diagnóstico y reporte de errores anónimos (únicamente con tu consentimiento expreso).
• DolarApi: Consulta de tasa de cambio oficial BCV (no recibe datos personales, solo consulta IP).`
    },
    {
      title: "5. Almacenamiento, Seguridad y Cifrado",
      body: `• Cifrado de transporte: Comunicaciones bajo TLS 1.2 o superior.
• Almacenamiento de sesión: Los tokens de sesión se guardan en el almacenamiento interno de la app, aislado por el sistema operativo (Secure Store / almacenamiento local cifrado).
• Bitácora de acciones: Acceso restringido a registros de auditoría y aislamiento multi-tenant a nivel de base de datos.`
    },
    {
      title: "6. Retención de Datos",
      body: `• Cuentas activas: Durante la vigencia del contrato.
• Registros contables y comprobantes: 5 años por obligación legal fiscal.
• Datos de visitantes: Se conservan por [CONFIRMAR días] para seguridad residencial y luego se purgan.
• Logs técnicos: Se conservan por [CONFIRMAR días] para diagnóstico.
• Solicitudes de derechos: 2 años desde su cierre.`
    },
    {
      title: "7. Derechos del Usuario y Mecanismos",
      body: `Conforme al Art. 28 y Art. 60 de la Constitución de la República Bolivariana de Venezuela, tienes derecho al acceso, rectificación, cancelación y oposición de tus datos, así como a retirar tu consentimiento opcional en cualquier momento. Puedes ejercerlos de forma directa desde la app en Perfil > Privacidad (Eliminar mi cuenta, Descargar mis datos o configurar preferencias). Plazo máximo de respuesta: 30 días hábiles.`
    },
    {
      title: "8. Datos de Menores de Edad",
      body: `La plataforma es exclusiva para mayores de 18 años mediante verificación de mayoría de edad por casilla obligatoria y control de padrón por la administración. Si se detecta un menor, se procede a su baja inmediata.`
    },
    {
      title: "9. Cookies y Almacenamiento Local",
      body: `Remitimos a nuestra Política de Cookies y Almacenamiento Local para el detalle técnico de las cookies técnicas y de sesión empleadas.`
    },
    {
      title: "10. Incidentes de Seguridad",
      body: `En caso de brechas o incidentes de seguridad que afecten datos personales, notificaremos a la administración y a los usuarios afectados sin demora injustificada (máximo 72 horas hábiles).`
    },
    {
      title: "11. Ley Aplicable y Jurisdicción",
      body: `La presente Política se rige por las leyes de la República Bolivariana de Venezuela.`
    }
  ],
  footer: {
    contactEmail: "[CONFIRMAR correo corporativo]",
    webPortal: "https://app-condominio.vercel.app",
    location: "República Bolivariana de Venezuela",
    copy: "© 2026 App Condominio — Todos los derechos reservados."
  }
};
