# Auditoría de Seguridad - Caminos de la Lagunita

## 1. Autenticación y Permisos
- **Flujo de Login**: Implementado mediante Supabase Auth (JWT). Los tokens se gestionan automáticamente.
- **Roles y Permisos**:
  - `resident`: Acceso a Dashboard, Pagos, Solicitudes, Invitados y Reservas.
  - `admin`: Acceso total a Gestión Administrativa, Finanzas y Aprobación de Usuarios.
  - `guard`: Acceso exclusivo al Portal de Vigilancia (Control de Accesos y QR).
- **Manejo de Sesiones**: Implementado con Zustand `persist` para mantener la sesión tras recargas. Se recomienda migrar a `sessionStorage` para datos altamente sensibles.

## 2. Validación de Entradas e Inyecciones
- **XSS (Cross-Site Scripting)**: React escapa automáticamente todas las variables renderizadas en el DOM. Se ha verificado que NO se utiliza `dangerouslySetInnerHTML`.
- **SQL Injection**: Al usar Supabase (PostgREST), todas las consultas son parametrizadas automáticamente por el cliente oficial, eliminando el riesgo de inyecciones SQL tradicionales.
- **Funciones de Seguridad**: Se ha corregido la función `is_admin` para usar un `search_path` fijo y restringir su ejecución vía RPC, mitigando vulnerabilidades de `SECURITY DEFINER`.
- **Sanitización**: Se recomienda añadir la librería `dompurify` si en el futuro se permite contenido HTML enviado por el usuario.

## 3. Protección de Secretos y Configuración
- **Variables de Entorno**: Se ha configurado el soporte para `.env`.
- **CORS**: Debe configurarse en el panel de Supabase para permitir ÚNICAMENTE el dominio oficial de producción.
- **Headers**: Se recomienda el uso de `Helmet` en el servidor de despliegue para añadir cabeceras `X-Content-Type-Options`, `X-Frame-Options`, y `Content-Security-Policy`.

## 4. Dependencias y Vulnerabilidades
- **Auditoría**: Ejecutar `npm audit` periódicamente.
- **Vigilancia**: Se recomienda integrar `Snyk` o `Dependabot` en el repositorio para alertas automáticas de paquetes desactualizados.

## 5. Logs y Monitoreo
- **Sentry**: Se recomienda integrar Sentry para capturar errores en tiempo real y telemetría de usuario.
- **Audit Logs**: El panel de Administración (SuperAdmin) debe registrar acciones críticas (Aprobación de usuarios, cambios de montos, cambios de roles).

## Plan de Respuesta a Incidentes
1. **Detección**: Alerta automática vía Sentry/Supabase Logs.
2. **Contención**: Revocación inmediata de JWTs afectados y rotación de API Keys si es necesario.
3. **Erradicación**: Parche de vulnerabilidad y despliegue de emergencia.
4. **Recuperación**: Restauración de DB (Supabase Point-in-time recovery) si hubo alteración de datos.
