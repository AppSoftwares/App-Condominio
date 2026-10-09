export interface LegalSection {
  title: string;
  body: string;
}

export const TERMS_AND_CONDITIONS = {
  title: "Términos y Condiciones de Servicio",
  lastUpdate: "26 de agosto de 2026",
  intro: `Los presentes Términos y Condiciones ("Términos") regulan el acceso y uso de la plataforma web y aplicación móvil App Condominio (en adelante, "la Plataforma" o "el Servicio"), operada bajo la denominación comercial App Condominio.

Al crear una cuenta, ingresar o utilizar la Plataforma, el usuario (bien sea la Junta de Condominio, la Administradora, el Propietario, el Arrendatario o el Vigilante) manifiesta su conformidad absoluta con las disposiciones aquí establecidas. Si no está de acuerdo con estos Términos, deberá abstenerse de utilizar el Servicio.`,
  sections: [
    {
      title: "1. Descripción del Servicio",
      body: `App Condominio es una plataforma tecnológica bajo la modalidad SaaS (Software como Servicio) diseñada para optimizar la gestión operativa, financiera, de comunicación y de gobernanza de conjuntos residenciales, edificios y condominios en la República Bolivariana de Venezuela.
El Servicio comprende las siguientes funcionalidades principales:
• Gestión de la Estructura Residencial: Padrón de unidades, inmuebles, propietarios, arrendatarios y alícuotas correspondientes.
• Módulo Financiero y Recaudación: Carga de avisos de cobro, desglose de gastos comunes y extraordinarios, conciliación y validación de pagos (transferencias, pago móvil u otros medios).
• Gobernanza Digital: Herramientas para la convocatoria, consulta digital, emisión de votos, control de quórum y trazabilidad en asambleas ordinarias y extraordinarias.
• Control de Acceso y Visitantes: Registro de ingresos, control vehicular y gestión de pases de visitantes mediante la aplicación móvil.
• Módulos Operativos: Reserva de áreas comunes, canalización de incidencias, cartelera virtual de avisos y repositorio documental del condominio.`
    },
    {
      title: "2. Registro de Cuentas y Responsabilidad de Credenciales",
      body: `1. Alta del Condominio: La activación de una comunidad o inmueble requiere ser ejecutada por un representante legal legítimo, administrador autorizado o por el equipo técnico de App Condominio.
2. Uso Individual e Intransferible: Cada cuenta de usuario se vincula a una persona natural. Queda estrictamente prohibido compartir credenciales de acceso (usuario y contraseña) entre múltiples individuos.
3. Custodia de Credenciales: El usuario es el único responsable de la confidencialidad de su contraseña y de las acciones realizadas desde su cuenta. Debe notificar de inmediato a App Condominio ante cualquier sospecha de acceso no autorizado o brecha de seguridad.
4. Veracidad de la Información: El usuario garantiza que la información suministrada es exacta, actualizada y veraz. Nos reservamos el derecho de suspender o revocar cuentas con datos falsos o suplantación de identidad.`
    },
    {
      title: "3. Suscripción, Tarifas y Forma de Pago",
      body: `1. Planes de Suscripción: El costo del Servicio se calcula bajo una modalidad de suscripción periódica basada en el número de unidades o apartamentos que conforman el condominio.
2. Moneda y Tasa de Cambio: Las tarifas de los planes están expresadas en dólares estadounidenses (USD) como unidad de referencia. Las facturas y pagos procesados dentro del territorio venezolano se liquidarán en Bolívares (Bs.) calculados a la tasa de cambio oficial publicada por el Banco Central de Venezuela (BCV) correspondiente a la fecha de la transacción o emisión de factura, conforme al marco legal cambiario vigente.
3. Período de Prueba (Trial): Se podrá otorgar un período de prueba gratuito de hasta treinta (30) días continuos. Vencido este plazo, se requerirá la selección de un plan activo para mantener el acceso al sistema.
4. Condiciones de Pago: La facturación se realiza de manera anticipada. La mora en el pago del plan por parte del condominio autoriza a App Condominio a suspender temporalmente el acceso a las funciones administrativas del sistema, previo aviso.
5. Ajuste de Precios: Nos reservamos el derecho de modificar las tarifas de suscripción mediante notificación enviada con al menos treinta (30) días de anticipación.`
    },
    {
      title: "4. Uso Aceptable de la Plataforma",
      body: `El usuario se obliga a hacer un uso diligente, correcto y lícito de la Plataforma. En particular, queda prohibido:
• Utilizar el Servicio para fines distintos a la administración y convivencia del condominio registrado.
• Introducir o difundir virus informáticos, malware o códigos maliciosos que atenten contra la seguridad de la infraestructura.
• Intentar realizar ingeniería inversa, descompilar o extraer el código fuente del portal web o la aplicación móvil.
• Acceder sin autorización a la información, bases de datos o paneles de control de otros condominios alojados en la Plataforma.
• Cargar contenido injurioso, difamatorio, ilegal o que vulnere la privacidad, el honor o la imagen de los residentes u otros terceros.
• Realizar ataques de denegación de servicio (DoS/DDoS) o enviar solicitudes masivas automatizadas que comprometan el rendimiento del servidor.`
    },
    {
      title: "5. Propiedad de los Datos y Exportación",
      body: `1. Titularidad: Toda la información cargada en la Plataforma (padrón de propietarios, soportes contables, registros de pago, actas y listas de visitas) es propiedad exclusiva del condominio o de los usuarios titulares. App Condominio no asume titularidad sobre dichos datos.
2. Rol de la Plataforma: App Condominio opera en calidad de Encargado del Tratamiento de los datos, procesándolos únicamente para la prestación efectiva del Servicio.
3. Exportación y Retención Post-Cancelación: En caso de terminación del servicio, la administración del condominio dispondrá de un plazo de treinta (30) días para descargar una copia estructurada de sus datos (formatos CSV/Excel). Cumplidos sesenta (60) días continuos tras la cancelación, los datos serán depurados de los servidores activos.`
    },
    {
      title: "6. Propiedad Intelectual",
      body: `La Plataforma App Condominio, incluyendo su código fuente, arquitectura de software, bases de datos, diseños de interfaz, logotipos, marcas y textos, son propiedad intelectual exclusiva de App Condominio.
El nombre e identificadores comerciales se encuentran protegidos bajo la legislación venezolana de propiedad industrial y el marco del Servicio Autónomo de la Propiedad Intelectual (SAPI). La contratación del servicio otorga únicamente una licencia de uso limitada, no exclusiva, revocable e intransferible durante el período de la suscripción.`
    },
    {
      title: "7. Disponibilidad, Nivel de Servicio (SLA) y Mantenimiento",
      body: `1. Disponibilidad: App Condominio realiza esfuerzos razonables para mantener una disponibilidad operativa de la plataforma del 99.5% mensual.
2. Mantenimientos Programados: Se podrán realizar labores de mantenimiento preventivo o actualizaciones que requieran la interrupción temporal del servicio, notificando con al menos veinticuatro (24) horas de antelación mediante la plataforma o correo electrónico.
3. Exclusiones de Garantía: App Condominio no se hace responsable por caídas del servicio o fallas de acceso derivadas de problemas de conectividad a Internet por parte de los proveedores ISP del usuario, interrupciones en el servicio eléctrico nacional o eventos de fuerza mayor.`
    },
    {
      title: "8. Limitación de Responsabilidad y Verificación de Pagos",
      body: `1. Falta de Responsabilidad por Cobranza o Conciliación: App Condominio es un canal digital y un soporte tecnológico; no es una entidad financiera ni un gestor de fondos. La Junta de Condominio o la Administradora son las únicas responsables de validar la autenticidad de los comprobantes de pago (transferencias, pago móvil, etc.) subidos por los propietarios.
2. Toma de Decisiones Internas: App Condominio no responde por resoluciones, sanciones, cobros o acuerdos adoptados por las Juntas de Condominio o las Asambleas de Propietarios basándose en los informes del sistema.
3. Límite de Indemnización: En caso de comprobarse judicialmente responsabilidad directa por negligencia grave atribuible a la Plataforma, la responsabilidad total máxima acumulada no excederá el monto equivalente pagado por el condominio contratante en los últimos tres (3) meses de servicio.`
    },
    {
      title: "9. Cumplimiento de la Ley Venezolana y Mensajes de Datos",
      body: `1. Validez Jurídica de la Información: Las notificaciones, avisos de cobro, registros de participación y votaciones generadas en la Plataforma se amparan bajo la Ley sobre Mensajes de Datos y Firmas Electrónicas, otorgándoles validez y eficacia probatoria en la medida en que cumplan con la integridad y disponibilidad exigidas por la ley.
2. Marco Normativo Condominial: Las herramientas organizativas del sistema apoyan la gestión del inmueble, pero no sustituyen ni modifican las obligaciones dispuestas en la Ley de Propiedad Horizontal venezolana, el documento de condominio ni el reglamento interno de cada edificio o residencial.`
    },
    {
      title: "10. Suspensión y Cancelación",
      body: `1. Por el Condominio: La administración podrá rescindir el servicio en cualquier momento enviando un aviso previo de treinta (30) días.
2. Por App Condominio: Podremos suspender o cancelar de forma inmediata el acceso a la cuenta si el usuario incurre en un incumplimiento grave de estos Términos, realiza actividades ilícitas o mantiene impagos de su plan de suscripción.`
    },
    {
      title: "11. Modificaciones a los Términos",
      body: `App Condominio podrá modificar estos Términos para adaptarlos a mejoras del software o cambios en el marco legal aplicable. Se informará a los usuarios sobre cambios relevantes con un plazo no menor a treinta (30) días antes de su entrada en vigor. El uso continuado del servicio tras la fecha señalada constituirá la aceptación expresa de los nuevos términos.`
    },
    {
      title: "12. Ley Aplicable y Jurisdicción",
      body: `Los presentes Términos y Condiciones se rigen e interpretan plenamente de conformidad con las leyes de la República Bolivariana de Venezuela.
Cualquier controversia, reclamo o desacuerdo derivado de la interpretación o ejecución del presente contrato que no pueda ser resuelto de mutuo acuerdo entre las partes, será sometido a la jurisdicción de los tribunales competentes en la República Bolivariana de Venezuela.`
    }
  ],
  footer: {
    contactEmail: "desarrollodeappcondominio@gmail.com",
    webPortal: "https://app-condominio-six.vercel.app/",
    location: "República Bolivariana de Venezuela",
    copy: "© 2026 App Condominio — Todos los derechos reservados."
  }
};

export const PRIVACY_POLICY = {
  title: "Política de Privacidad",
  lastUpdate: "26 de agosto de 2026",
  intro: `App Condominio ("nosotros", "nuestra plataforma") opera el sistema de administración y gestión residencial accesible a través del portal web https://app-condominio-six.vercel.app/ y sus aplicaciones móviles oficiales para Android e iOS.
Esta Política de Privacidad describe cómo recopilamos, procesamos, almacenamos y protegemos la información personal de los usuarios. Al registrarse o utilizar App Condominio, usted acepta los términos descritos en el presente documento. Si no está de acuerdo con estas disposiciones, le solicitamos abstenerse de utilizar nuestros servicios.`,
  sections: [
    {
      title: "1. Naturaleza del Tratamiento de Datos",
      body: `A los efectos legales aplicables, la Junta de Condominio o la Empresa Administradora del inmueble actúa como Responsable del Tratamiento de los datos del residencial. App Condominio actúa estrictamente en calidad de Encargado del Tratamiento, proporcionando la infraestructura tecnológica para la gestión operativa y financiera del condominio.`
    },
    {
      title: "2. Información que Recopilamos",
      body: `A. Información proporcionada directamente por el usuario
• Datos de cuenta: Nombre, apellido, correo electrónico, número de teléfono y contraseña cifrada.
• Datos del inmueble: Nombre del conjunto o edificio, RIF, dirección física, número de unidad (bloque, torre, apartamento o casa) y porcentaje de alícuota.
• Información financiera y contable: Montos de cuotas, estado de cuenta, historial de pagos y comprobantes digitalizados (imágenes de transferencias o depósitos bancarios).
• Documentación residencial: Reglamentos internos, actas de asambleas, avisos de cobro y archivos institucionales cargados por la administración.
• Control de accesos y visitantes: Nombre completo, número de cédula de identidad o pasaporte del visitante, fecha/hora de ingreso, placa del vehículo y unidad de destino, registrados por el residente o por el personal de seguridad.
• Interacciones y participación: Votos emitidos en consultas o asambleas digitales, reportes de incidencias, reservas de áreas comunes y mensajes enviados mediante la plataforma.

B. Información recopilada automáticamente
• Datos de diagnóstico y dispositivo: Dirección IP, tipo de dispositivo, sistema operativo, modelo del terminal e identificadores únicos de dispositivo móvil.
• Permisos de la aplicación móvil: Acceso a la cámara y galería (exclusivamente para capturar o adjuntar comprobantes de pago y fotos de perfil) y notificaciones push.
• Registros de actividad (Audit Log): Bitácora inmutable de acciones realizadas en el sistema (inicios de sesión, registros de pago, votaciones y cambios de configuración) para auditoría interna.`
    },
    {
      title: "3. Finalidad del Tratamiento de Datos",
      body: `• Gestión operativa del condominio: Emisión de avisos de cobro, conciliación de pagos, gestión de cartera de morosos y facilitación de la comunicación interna.
• Control de seguridad y acceso: Verificación de identidad de residentes y registro de entradas/salidas de visitantes.
• Gobernanza digital: Ejecución de votaciones, encuestas y asambleas no presenciales con validez técnica.
• Seguridad de la plataforma: Detección de fraudes, autenticación de usuarios y prevención de accesos no autorizados.
• Cumplimiento legal y fiscal: Conservación de registros financieros según la legislación venezolana aplicable.

Garantía de Privacidad: App Condominio no comercializa, alquila ni cede datos personales a terceros. Los datos de un condominio no son accesibles por otros conjuntos residenciales ni se utilizan para el entrenamiento de modelos de inteligencia artificial.`
    },
    {
      title: "4. Compartición y Transferencia de Datos",
      body: `Podemos compartir información únicamente en los siguientes escenarios:
• Proveedores de infraestructura (Encargados de tecnología): Servicios de almacenamiento en la nube, bases de datos y entrega de correos electrónicos transaccionales. Estos proveedores operan bajo estrictas cláusulas de confidencialidad y estándares internacionales de seguridad.
• Administración del Condominio: La Junta de Condominio y la Administradora designada tienen acceso exclusivo a la información correspondiente a las unidades bajo su gestión.
• Requerimiento Legal: Cuando sea exigido por un tribunal competente o autoridades públicas de la República Bolivariana de Venezuela en el marco de una investigación legal.`
    },
    {
      title: "5. Almacenamiento, Seguridad y Transferencia Internacional",
      body: `• Infraestructura Cloud: Los datos son procesados y almacenados mediante Supabase en servidores seguros ubicados en Europa (Londres / West Europe).
• Cifrado de Credenciales: Las contraseñas se gestionan mediante el algoritmo de hash seguro bcrypt. Nunca se procesan ni almacenan en texto plano.
• Seguridad en Tránsito y Reposo: Todas las comunicaciones entre el cliente (web/móvil) y la base de datos están cifradas bajo protocolos HTTPS/TLS 1.3. Los archivos subidos cuentan con políticas de acceso restrictivo (Row Level Security).
• Aislamiento de Datos: Multi-tenancy garantizado a nivel de base de datos para evitar el cruce de información entre condominios.`
    },
    {
      title: "6. Retención y Cancelación de Datos",
      body: `• Cuentas Activas: Los datos se conservan mientras la relación contractual entre el condominio y la plataforma permanezca vigente.
• Registros Contables: Los comprobantes de pago y estados de cuenta se conservan por el período mínimo legal exigido para fines fiscales y contables (5 años).
• Cancelación del Servicio: Al finalizar la relación comercial con un condominio, la administración podrá solicitar la exportación completa de sus datos (formatos CSV/Excel). Los datos activos serán eliminados de los servidores de producción en un lapso no mayor a sesenta (60) días continuos.`
    },
    {
      title: "7. Derechos del Usuario",
      body: `De conformidad con el ordenamiento jurídico venezolano, todo residente o usuario tiene derecho a:
• Acceso y Rectificación: Consultar sus datos personales y solicitar la actualización o corrección de información inexacta.
• Supresión: Solicitar la eliminación de su cuenta personal (sujeto a las obligaciones legales de conservación contable del condominio).
• Portabilidad: Obtener un resumen exportable de sus registros e historial financiero.
Para ejercer estos derechos, el usuario puede enviar una solicitud formal a la dirección de correo indicada al final de este documento.`
    },
    {
      title: "8. Datos de Menores de Edad",
      body: `App Condominio está diseñada exclusivamente para personas mayores de 18 años con capacidad legal para asumir obligaciones de propietarios o inquilinos. No recopilamos intencionalmente información de menores de edad. Si se detecta el registro no autorizado de un menor, la cuenta será desactivada de inmediato.`
    },
    {
      title: "9. Tecnologías de Almacenamiento Local (Cookies y Session Storage)",
      body: `• Plataforma Web: Utiliza localStorage y cookies técnicas estrictamente necesarias para autenticar la sesión del usuario y mantener la seguridad activa.
• App Móvil: Utiliza almacenamiento seguro del dispositivo (Secure Store / EncryptedSharedPreferences) para mantener los tokens de sesión cifrados.
• No Rastreo Comercial: No utilizamos scripts de seguimiento publicitario, píxeles de remarketing ni compartimos hábitos de navegación con agencias externas.`
    },
    {
      title: "10. Ley Aplicable y Jurisdicción",
      body: `La presente Política de Privacidad se rige e interpreta de conformidad con la legislación vigente de la República Bolivariana de Venezuela. En particular, se sujeta a:
• La Ley de Propiedad Horizontal.
• La Ley Especial Contra los Delitos Informáticos.
• La Ley sobre Mensajes de Datos y Firmas Electrónicas.
• La Ley Orgánica de Telecomunicaciones.
• La Ley para la Defensa de las Personas en el Acceso a los Bienes y Servicios.
• Las disposiciones de la Constitución de la República Bolivariana de Venezuela (Art. 60) relativas al honor, vida privada, intimidad, propia imagen y protección de datos personales.
Cualquier controversia o reclamo derivado del uso de la plataforma será sometido a los tribunales competentes del territorio de la República Bolivariana de Venezuela.`
    }
  ],
  footer: {
    contactEmail: "desarrollodeappcondominio@gmail.com",
    webPortal: "https://app-condominio-six.vercel.app/",
    location: "República Bolivariana de Venezuela",
    copy: "© 2026 App Condominio — Todos los derechos reservados."
  }
};
