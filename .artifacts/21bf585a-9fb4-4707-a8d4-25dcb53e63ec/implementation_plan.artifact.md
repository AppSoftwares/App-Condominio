# Plan de Mejora de Notificaciones, Autenticación y Perfil

Revisión técnica senior para estabilizar el sistema de notificaciones en modo Doze, corregir errores de registro de usuarios y asegurar la persistencia de fotos de perfil en Supabase.

## User Review Required

> [!IMPORTANT]
> **Configuración de Firebase:** Para que las notificaciones funcionen en "modo dormido" (Doze), se requiere que el archivo `google-services.json` esté correctamente integrado en el proyecto Android y que se configure la API de FCM en las Edge Functions de Supabase.
> **Deep Linking:** Para los correos de recuperación, es vital configurar el "Site URL" en Supabase como `com.caminosapp://login` o similar para que el enlace abra la app directamente.

## Proposed Changes

### 1. Notificaciones Push (Estabilidad y Modo Doze)

#### [MODIFY] [usePushNotifications.ts](file:///C:/Users/admin/Documents/CaminosApp/src/hooks/usePushNotifications.ts)
- Mejorar el registro del token para asegurar que se capture el token nativo de FCM.

#### [MODIFY] [send-push/index.ts](file:///C:/Users/admin/Documents/CaminosApp/supabase/functions/send-push/index.ts)
- Cambiar el endpoint de Expo por el de FCM Directo (o Expo con prioridad alta). Dado que Capacitor usa FCM nativo, lo ideal es usar FCM directamente para evitar la incompatibilidad de tokens.

#### [MODIFY] [notificationService.ts](file:///C:/Users/admin/Documents/CaminosApp/src/services/notificationService.ts)
- Asegurar que el payload incluya `priority: high` y los campos de datos necesarios para despertar al dispositivo.

### 2. Autenticación y Registro

#### [MODIFY] [Register.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/auth/Register.tsx)
- Agregar `emailRedirectTo` en `signUp` para manejar correctamente la redirección post-validación.
- Validar la limpieza de datos antes del envío.

### 3. Perfil y Fotos (Persistencia)

#### [MODIFY] [Profile.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/prof/Profile.tsx)
- Optimizar la lógica de subida a Supabase Storage y asegurar que la URL sea pública y accesible.

#### [NEW] [storage_setup.sql](file:///C:/Users/admin/Documents/CaminosApp/supabase/storage_setup.sql)
- Script para crear el bucket `avatars` y configurar las políticas RLS necesarias.

## Verification Plan

### Automated Tests
- n/a (Pruebas manuales requeridas por ser hardware/push).

### Manual Verification
- Registrar un nuevo usuario y verificar la recepción del correo de confirmación.
- Cambiar la foto de perfil y recargar la app para confirmar persistencia.
- Enviar una notificación de prueba con el teléfono bloqueado para verificar el despertar (Doze mode).
