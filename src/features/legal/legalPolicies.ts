import { LEGAL_ENTITY } from '../../config/legalEntity'

export const COOKIES_POLICY = {
  title: "Política de Cookies y Almacenamiento Local",
  lastUpdate: "09 de octubre de 2026",
  intro: "Esta política explica qué información guarda App Condominio en tu navegador o dispositivo y para qué. No usamos publicidad ni rastreo comercial.",
  sections: [
    {
      title: "1. Qué usamos y para qué",
      body: `• Sesión de autenticación (clave sb-*-auth-token, almacenamiento local/seguro): mantener tu sesión iniciada. NECESARIA. Duración: hasta cerrar sesión.
• Estado de la app (auth-storage-v6): perfil básico para abrir la app más rápido y funcionar sin conexión. NECESARIA. Hasta cerrar sesión.
• Preferencia de tema (theme-storage): modo claro/oscuro. FUNCIONAL. Hasta borrarla.
• Bloqueo biométrico (biometric_enabled): recordar que activaste huella/Face ID. FUNCIONAL. Hasta desactivarlo. (La biometría la gestiona tu dispositivo; la app no recibe tu huella ni tu rostro.)
• Cola sin conexión (base local caminos-offline-db): guarda temporalmente pagos, visitas o paquetes registrados sin internet hasta poder enviarlos. NECESARIA. Se elimina al sincronizar.
• Registro de tus preferencias de privacidad (consent-v1): NECESARIA para recordar tu decisión. Duración: hasta 12 meses desde tu decisión.
• Diagnóstico de errores (Sentry): OPCIONAL, solo si lo aceptas. Informes de errores sin datos personales. Puedes retirarlo en Perfil > Privacidad.`
    },
    {
      title: "2. Servicios de terceros que reciben tu dirección IP",
      body: `Supabase, Vercel, Google (notificaciones push e inicio de sesión si lo usas), DolarApi (tasa de cambio).`
    },
    {
      title: "3. Cómo gestionar tus preferencias",
      body: `Perfil > Privacidad > Preferencias; también desde tu navegador o desde los ajustes del sistema (borrar datos de la app). Borrar datos necesarios cerrará tu sesión.`
    },
    {
      title: "4. Cambios",
      body: `Se te pedirá de nuevo tu decisión si cambian las categorías de almacenamiento.`
    },
    {
      title: "5. Contacto",
      body: `Para cualquier consulta sobre esta política, puedes contactar al responsable de protección de datos en ${LEGAL_ENTITY.dataProtectionContact} o a través de ${LEGAL_ENTITY.contactEmail}.`
    }
  ]
};

export const REFUND_POLICY = {
  title: "Política de Reembolso y Cancelación",
  lastUpdate: "09 de octubre de 2026",
  intro: "Condiciones aplicables al servicio contratado por la administración del condominio con App Condominio.",
  sections: [
    {
      title: "1. Alcance",
      body: `Aplica a la suscripción que contrata el condominio/administradora. Los residentes no pagan una suscripción a la plataforma; los pagos de cuotas condominiales se hacen a la administración, no a App Condominio (que no es entidad financiera ni gestora de fondos).`
    },
    {
      title: "2. Periodo de prueba",
      body: `Hasta 30 días sin costo; no se cobra si se cancela antes de su finalización.`
    },
    {
      title: "3. Cancelación",
      body: `La administración puede cancelar en cualquier momento con aviso previo de 30 días desde Perfil > Cancelar servicio o por correo electrónico. La cancelación surte efecto al finalizar el período facturado o tras el transcurso de los 30 días de preaviso. Se confirma por correo con la fecha efectiva.`
    },
    {
      title: "4. Reembolsos",
      body: `Sin reembolso de períodos ya iniciados, salvo (a) cobro duplicado o erróneo, o (b) indisponibilidad del servicio por debajo del SLA del 99,5% imputable a la plataforma (crédito proporcional). Plazo de resolución: 15 días hábiles. Devolución por el mismo medio de pago y moneda original.`
    },
    {
      title: "5. Cambios de precio",
      body: `Aвиso previo de 30 días; si no estás de acuerdo puedes cancelar sin penalidad antes de que rija el nuevo precio.`
    },
    {
      title: "6. Datos tras cancelar",
      body: `30 días para exportar (CSV/Excel) y eliminación de los servidores activos a los 60 días, salvo registros contables conservados por obligación legal.`
    },
    {
      title: "7. Reclamos",
      body: `Correo a ${LEGAL_ENTITY.contactEmail} con respuesta en 15 días hábiles, sin perjuicio de las vías administrativas o judiciales que correspondan.`
    }
  ]
};

export const DATA_DELETION_POLICY = {
  title: "Procedimiento de Eliminación de Datos (Derecho al Olvido)",
  lastUpdate: "09 de octubre de 2026",
  intro: "Procedimiento para ejercer tu derecho a la supresión de datos personales en App Condominio.",
  sections: [
    {
      title: "1. Cómo solicitarlo",
      body: `(a) En la app: Perfil > Eliminar mi cuenta y mis datos.\n(b) Sin acceso a la app: correo a ${LEGAL_ENTITY.contactEmail} desde el correo registrado, con asunto "Eliminación de cuenta", nombre completo y unidad.`
    },
    {
      title: "2. Verificación de identidad",
      body: `Reautenticación en la app o respuesta a un enlace de confirmación enviado al correo registrado.`
    },
    {
      title: "3. Qué se elimina",
      body: `Perfil y datos de contacto, avatar, token de notificaciones, dispositivos, sesiones y preferencias.`
    },
    {
      title: "4. Qué se conserva (y por qué)",
      body: `Registros contables y comprobantes de pago, actas y votos que forman parte del expediente del condominio por el plazo legal de 5 años, separados de tu identidad (anonimizados) cuando sea posible.`
    },
    {
      title: "5. Plazos",
      body: `Acuse de recibo en <= 72 horas; ejecución completa en <= 30 días.`
    },
    {
      title: "6. Administradores",
      body: `Si eres administrador, debes transferir la administración antes de solicitar la baja.`
    }
  ]
};
