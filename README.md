# 🏰 Caminos de la Lagunita - Software de Aplicaciones JP

🏢 Sistema Premium de Gestión Residencial para el **Condominio Conjunto 14 Las Huertas** (RIF: J-29900732-3).

**Sitio Web:** [https://github.com/AppSoftwares/Proyecto-stitch-google-Caminos-de-la-Lagunita](https://github.com/AppSoftwares/Proyecto-stitch-google-Caminos-de-la-Lagunita)

## 🚀 Funcionalidades Clave
- **Gestión de Nómina:** Cálculo automático de beneficios LOTTT y edición individual de salarios.
- **Relación Mensual:** Generación de reportes profesionales en PDF y Excel con identidad corporativa oficial.
- **Integración SEDEMAT:** Carga y procesamiento automático de comprobantes de pago de servicios municipales (Aseo y Gas).
- **Portal del Residente:** Dashboard premium con transparencia total en el estado de cuenta y servicios de la comunidad.
- **Multi-plataforma:** Disponible para Web y dispositivos Android (APK) vía Capacitor.

## 🛠 Tech Stack
- **Frontend:** React + TypeScript + Tailwind CSS
- **Mobile:** Capacitor (Android Native)
- **Backend:** Supabase (PostgreSQL & Auth)
- **Reportes:** jsPDF & SheetJS (XLSX)

## 📱 Instalación
1. Clonar el repositorio.
2. `npm install`
3. `npm run build`
4. `npx cap sync android`
5. `npm run build:apk` (Para generar el archivo .apk final)
6. El APK se generará en: `android/app/build/outputs/apk/release/`

*Desarrollado para la excelencia en la convivencia residencial.*

## Deployment / Producción

Recomendaciones rápidas para poner la aplicación en un entorno de producción:

- Copia `.env.example` a `.env` (backend) y `.env.local` (frontend) y rellena las variables sensibles.
- Asegúrate de usar una base de datos Postgres en producción y ajustar `DATABASE_URL`.
- Genera un `SECRET_KEY` seguro (por ejemplo `python -c "import secrets; print(secrets.token_urlsafe(48))"`).
- Para generar una API key para uso con el backend, usa:

```bash
python scripts/generate_api_key.py
```

### Backend (ejecutar localmente)

Instala dependencias y arranca el servidor:

```bash
python -m pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Si usas Alembic para migraciones, crea la primera migración y aplícala:

```bash
# Crear nueva migración (requiere alembic instalado)
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

La carpeta `alembic/versions/` contiene una migración inicial de ejemplo.

### Sentry (monitoring)

Configura `SENTRY_DSN` (backend) y `VITE_SENTRY_DSN` (frontend) en tu `.env` para habilitar Sentry. La app inicializa Sentry automáticamente si detecta el DSN.

### Producción con Docker

Ejemplo rápido para producir imágenes y desplegarlas con `docker-compose.prod.yml`:

```bash
# Construir y arrancar en producción (en el host de despliegue):
docker compose -f docker-compose.prod.yml up --build -d

# Correr migraciones dentro del contenedor backend
docker compose -f docker-compose.prod.yml run --rm backend bash -c "alembic upgrade head"
```

### CI / Publicar imágenes

Se incluyó un workflow de GitHub Actions en `.github/workflows/deploy.yml` que construye y publica las imágenes al GitHub Container Registry (GHCR). Configura `GITHUB_TOKEN`/permisos y publica desde la rama `main`.

Al iniciar, el backend intentará crear tablas y usuarios iniciales si la DB está vacía.

### Frontend (build)

Variables de entorno para frontend: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

```bash
pnpm install
pnpm build
```

### Docker (opción rápida de desarrollo)

Arranca Postgres y el backend con docker-compose:

```bash
docker compose up --build -d
# Ver logs del backend:
docker compose logs -f backend
```

Backup de la base de datos (local):

```bash
PGHOST=localhost PGPORT=5432 PGUSER=postgres PGPASSWORD=postgres PGDATABASE=caminos ./scripts/backup_db.sh
```

Restore:

```bash
PGHOST=localhost PGPORT=5432 PGUSER=postgres PGPASSWORD=postgres PGDATABASE=caminos ./scripts/restore_db.sh backups/caminos_backup_YYYYMMDD_HHMMSS.dump
```

### Notas finales

- Evita mantener credenciales hardcodeadas en el frontend.
- Habilita monitoreo (Sentry) y backups para la base de datos en producción.
- Si necesitas, puedo ayudarte a preparar scripts de despliegue más avanzados (Docker, CI/CD, migraciones).
