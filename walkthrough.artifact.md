# Implementación del Flujo de Invitaciones

Se ha reemplazado el sistema de autoregistro por un flujo de invitaciones gestionado por administradores, mejorando la seguridad y el control del acceso al condominio.

## Cambios Realizados

### Backend (Supabase Edge Function)
- **Nueva Función**: [invite-resident](file:///C:/Users/admin/Documents/CaminosApp/supabase/functions/invite-resident/index.ts)
  - Verifica privilegios de administrador/superadmin.
  - Usa la API administrativa de Supabase para invitar usuarios por correo.
  - Crea automáticamente el perfil en la tabla `profiles` con estado `active`.
  - Configura metadatos iniciales (`password_set: false`).

### Frontend (Administración)
- **Panel de Control**: Se añadió un modal de invitación en [Admin.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/admin/Admin.tsx).
  - Permite ingresar correo, nombre, apellido, número de casa y rol.
  - Invocación segura a la Edge Function mediante `supabase.functions.invoke`.

### Frontend (Autenticación)
- **Definición de Contraseña**: Mejora en [ResetPassword.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/auth/ResetPassword.tsx).
  - Detecta si es la primera vez que el usuario accede (invitación).
  - Actualiza metadatos para marcar que la contraseña ha sido establecida.
- **Acceso Restringido**: Se ocultaron los botones de "Solicitar Acceso" en [AuthSplash.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/auth/AuthSplash.tsx) y [Splash.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/auth/Splash.tsx) para priorizar el flujo de invitación.

## Guía de Configuración Manual
Consulta el archivo [README_INVITATION_FLOW.md](file:///C:/Users/admin/Documents/CaminosApp/README_INVITATION_FLOW.md) para los pasos necesarios en el Dashboard de Supabase:
1. Configurar URLs de redirección.
2. Personalizar plantillas de correo.
3. Configurar SMTP y Secrets (`APP_URL`).

## Verificación
1. **Administrador**: Acceder a la pestaña "Usuarios", pulsar "Invitar Residente", completar datos y enviar.
2. **Residente**: Recibir correo, pulsar enlace, ser redirigido a la app, establecer contraseña y entrar al Dashboard.
