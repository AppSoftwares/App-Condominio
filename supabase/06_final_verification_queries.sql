-- CONSULTAS DE VERIFICACIÓN PARA EL ADMINISTRADOR
-- Ejecuta esto para ver el estado de las notificaciones

-- 1. Ver cola de notificaciones y errores
SELECT status, error_message, count(*)
FROM public.push_notifications
GROUP BY status, error_message;

-- 2. Ver usuarios con token registrado
SELECT email, expo_push_token, last_token_update
FROM public.profiles
WHERE expo_push_token IS NOT NULL;
