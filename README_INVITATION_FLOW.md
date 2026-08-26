# Flujo de Invitación de Residentes

Este proyecto ha migrado de un autoregistro abierto a un flujo de invitación controlado por el administrador. A continuación se detallan los pasos manuales necesarios en el Dashboard de Supabase para completar la configuración.

## 1. Configuración de URLs de Redirección
Para que los residentes lleguen a la pantalla correcta después de aceptar la invitación:
1. Ve a **Authentication > URL Configuration**.
2. En **Redirect URLs**, agrega las siguientes direcciones:
   - `https://app-condominio.vercel.app/reset-password` (Producción)
   - `http://localhost:5173/reset-password` (Desarrollo)

## 2. Plantilla de Correo de Invitación
Personaliza el mensaje que recibirán los residentes:
1. Ve a **Authentication > Email Templates**.
2. Selecciona la pestaña **Invite user**.
3. Ajusta el asunto y el cuerpo del mensaje. Asegúrate de que el enlace use la variable `{{ .ConfirmationURL }}`.

## 3. Configuración de SMTP (Recomendado)
El servicio de correo gratuito de Supabase tiene límites estrictos. Para producción:
1. Ve a **Project Settings > Auth**.
2. En la sección **SMTP Settings**, configura un proveedor como Resend, SendGrid o Mailgun.

## 4. Configuración de Secrets en Supabase
Para que la Edge Function `invite-resident` funcione, debes configurar la URL base de la aplicación:
Ejecuta el siguiente comando en tu terminal (usando el CLI de Supabase):
```bash
supabase secrets set APP_URL=https://app-condominio.vercel.app
```

## 5. Despliegue de la Edge Function
Si no lo has hecho, despliega la función:
```bash
supabase functions deploy invite-resident
```

## Resumen de Cambios Técnicos
- **Edge Function (`invite-resident`)**: Valida que el llamador sea admin y usa `auth.admin.inviteUserByEmail` con la `service_role` key.
- **Admin Panel**: Nueva interfaz en la pestaña "Usuarios" para enviar invitaciones.
- **Reset Password**: Detecta automáticamente si es una invitación inicial y marca el perfil como `password_set: true`.
- **Registro**: Se ha ocultado el botón de "Solicitar Acceso" en las pantallas principales para centralizar el flujo en las invitaciones.
