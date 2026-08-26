# Plan de Migración a TanStack Query y React Hook Form

Este plan detalla la configuración de TanStack Query y la migración incremental de la lógica de fetching y formularios en la aplicación CaminosApp.

## User Review Required

> [!IMPORTANT]
> Se instalarán nuevas dependencias: `react-hook-form`, `zod`, `@hookform/resolvers` y `@tanstack/react-query-devtools`.
> Se modificará el punto de entrada `src/main.tsx` para incluir el `QueryClientProvider`.

## Proposed Changes

### Infraestructura y Configuración

#### [NEW] [queryClient.ts](file:///C:/Users/admin/Documents/CaminosApp/src/lib/queryClient.ts)
Configuración centralizada del cliente de TanStack Query con tiempos de expiración y reintentos optimizados para una app móvil Capacitor.

#### [MODIFY] [main.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/main.tsx)
Envolver la aplicación con `QueryClientProvider` y añadir `ReactQueryDevtools` condicionado al entorno de desarrollo.

---

### Hooks de Query y Mutación (TanStack Query)

#### [NEW] [useProfiles.ts](file:///C:/Users/admin/Documents/CaminosApp/src/queries/useProfiles.ts)
Hooks para gestionar perfiles: `useProfiles` (lista), `useApproveUser` (mutación), `useInviteResident` (mutación via Edge Function).

#### [NEW] [useVotings.ts](file:///C:/Users/admin/Documents/CaminosApp/src/queries/useVotings.ts)
Hooks para gestionar votaciones encapsulando `votingService`.

#### [NEW] [usePaymentsAdmin.ts](file:///C:/Users/admin/Documents/CaminosApp/src/queries/usePaymentsAdmin.ts)
Hooks para la gestión de pagos en el panel administrativo.

---

### Migración de Componentes (Panel Admin)

#### [MODIFY] [Admin.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/admin/Admin.tsx)
- Reemplazar `fetchData` y estados manuales por los nuevos hooks.
- Implementar `react-hook-form` en el formulario de "Invitar Residente" con validación `zod`.
- Vincular la mutación `useInviteResident` al envío del formulario.

---

### Migración de Formularios de Autenticación

#### [MODIFY] [Login.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/auth/Login.tsx)
Migrar a `react-hook-form` manteniendo la lógica híbrida de Whitelist y Supabase Auth.

#### [MODIFY] [ResetPassword.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/auth/ResetPassword.tsx)
Migrar el formulario de nueva contraseña a `react-hook-form`.

## Verification Plan

### Automated Tests
- No hay tests automatizados configurados actualmente que cubran estos flujos, pero se verificará la compilación y ausencia de errores de linting.

### Manual Verification
- **Admin**: Cargar el tab de usuarios y verificar que se listan correctamente. Probar la invitación de un residente y ver el estado de carga.
- **Login**: Intentar iniciar sesión con credenciales válidas e inválidas. Verificar que los mensajes de error de validación (ej. email mal formado) aparecen instantáneamente.
- **Reset Password**: Verificar el flujo de cambio de contraseña.
- **Zustand Coexistencia**: Asegurar que la sesión (`useAuthStore`) se mantiene persistente tras los cambios.
