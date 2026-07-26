# Plan de Migración de Render a Vercel (Full-Stack)

El objetivo es unificar el despliegue del frontend y el backend en **Vercel**, aprovechando que ya tienes un proyecto de Vercel para el frontend. El backend (FastAPI) se ejecutará como una **Vercel Serverless Function** en Python.

## User Review Required

> [!IMPORTANT]
> **Consolidación de Proyecto**: El backend ahora vivirá bajo el mismo dominio que el frontend. Esto significa que las peticiones se harán a `https://app-condominio.vercel.app/api/...`. Esto elimina problemas de CORS y latencia entre servidores.

> [!WARNING]
> **Variables de Entorno en Vercel**: Deberás ir al panel de Vercel (Settings > Environment Variables) y añadir todas las variables que estaban en el `.env`, especialmente `DATABASE_URL` (usando el pool URL de Supabase) y `SECRET_KEY`.

## Proposed Changes

### [Backend - Vercel Serverless]

#### [NEW] [api/index.py](file:///C:/Users/admin/Documents/CaminosApp/api/index.py)
- Punto de entrada para Vercel. Importará la instancia `app` de `app.main`.

#### [NEW] [vercel.json](file:///C:/Users/admin/Documents/CaminosApp/vercel.json)
- Configuración de rutas. Redirigirá todas las peticiones a `/api/(.*)` hacia el archivo Python, permitiendo que FastAPI maneje el sub-enrutamiento.

#### [DELETE] [render.yaml](file:///C:/Users/admin/Documents/CaminosApp/render.yaml)
- Ya no es necesario al abandonar Render.com.

---

### [Frontend - Configuración]

#### [MODIFY] [.env](file:///C:/Users/admin/Documents/CaminosApp/.env)
- Actualizar `VITE_BACKEND_URL` para que apunte al mismo dominio (`/api` o la URL completa de Vercel).

---

### [Repository & Instructions]

#### [MODIFY] [walkthrough.artifact.md](file:///C:/Users/admin/Documents/CaminosApp/.artifacts/0b3db42d-bfaf-493c-b5b5-6ca6ffb0f5a6/walkthrough.artifact.md)
- Añadir pasos para configurar Vercel y eliminar dependencias de Render.

## Verification Plan

### Automated Tests
- Validar que `api/index.py` puede importar `app.main` sin errores de path.
- Verificar que el `requirements.txt` en la raíz contiene todas las dependencias necesarias para las Serverless Functions.

### Manual Verification
1.  **Despliegue**: Subir cambios a GitHub. Vercel detectará el directorio `api/` automáticamente.
2.  **Prueba de API**: Acceder a `https://app-condominio.vercel.app/api/v1/votings/` (o un endpoint público) para confirmar que responde el backend.
3.  **CORS**: Verificar que las llamadas desde el frontend ya no requieren configuraciones complejas de orígenes permitidos.
