import os
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlmodel import Session
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.database import get_session, init_db, engine
from app.core.limiter import limiter
from app.core.security import create_tokens, verify_api_key, hash_password
from app.core.sentry_integration import init_sentry, wrap_app_with_sentry
from app.routers import buildings, announcements, accounting, reports, reservations, guests, votings, security_admin, auth

app = FastAPI(title="Caminos de la Lagunita API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Registrar el error completo en Sentry si está disponible
    try:
        import sentry_sdk
        sentry_sdk.capture_exception(exc)
    except ImportError:
        pass

    # Devolver un mensaje genérico al cliente
    return JSONResponse(
        status_code=500,
        content={"detail": "Ocurrio un error inesperado. Intenta de nuevo."}
    )

# Inicializar Sentry si está configurado
try:
    init_sentry()
except Exception:
    pass

@app.on_event("startup")
def on_startup():
    init_db()
    with Session(engine) as session:
        from app.models.entities import Amenity, Resident, Building, Section, Unit, Voting, Announcement, Debt
        from datetime import datetime, timedelta
        from sqlmodel import select

        # 1. Crear Edificio, Sección y Unidad base
        building = session.exec(select(Building)).first()
        if not building:
            building = Building(nombre="Caminos de la Lagunita", direccion="Av. Principal 123", cantidad_pisos=10, cantidad_torres=2, cantidad_apartamentos=100)
            session.add(building)
            session.commit()
            session.refresh(building)

        section = session.exec(select(Section)).first()
        if not section:
            section = Section(edificio_id=building.id, nombre="Torre A", tipo="torre", cantidad_pisos=10)
            session.add(section)
            session.commit()
            session.refresh(section)

        unit = session.exec(select(Unit)).first()
        if not unit:
            unit = Unit(seccion_id=section.id, identificador="A-101", tipo="apartamento", piso=1)
            session.add(unit)
            session.commit()
            session.refresh(unit)

        # 2. Crear Areas Comunes
        if not session.exec(select(Amenity)).first():
            session.add(Amenity(nombre="Piscina", capacidad=20))
            session.add(Amenity(nombre="Salón de Fiestas", capacidad=50))
            session.add(Amenity(nombre="Cancha de Tenis", capacidad=4))

        # 3. Crear Usuarios Iniciales (Solo si SEED_INITIAL_USERS=true)
        if os.getenv("SEED_INITIAL_USERS", "false").lower() == "true":
            def _get_required_env(key: str) -> str:
                val = os.getenv(key)
                if not val:
                    raise RuntimeError(f"Falta variable de entorno requerida para seeding: {key}")
                return val

            initial_users = [
                {
                    "nombre": _get_required_env("SEED_ADMIN_NAME"),
                    "email": _get_required_env("SEED_ADMIN_EMAIL"),
                    "password": _get_required_env("SEED_ADMIN_PASSWORD"),
                    "rol": "admin",
                    "unit": None
                },
                {
                    "nombre": _get_required_env("SEED_CARLOS_NAME"),
                    "email": _get_required_env("SEED_CARLOS_EMAIL"),
                    "password": _get_required_env("SEED_CARLOS_PASSWORD"),
                    "rol": "propietario",
                    "unit": "14-28"
                },
                {
                    "nombre": _get_required_env("SEED_JESUS_NAME"),
                    "email": _get_required_env("SEED_JESUS_EMAIL"),
                    "password": _get_required_env("SEED_JESUS_PASSWORD"),
                    "rol": "propietario",
                    "unit": "14-28"
                },
                {
                    "nombre": _get_required_env("SEED_GUARD_NAME"),
                    "email": _get_required_env("SEED_GUARD_EMAIL"),
                    "password": _get_required_env("SEED_GUARD_PASSWORD"),
                    "rol": "vigilante",
                    "unit": None
                },
            ]

            for u_data in initial_users:
                user_exists = session.exec(select(Resident).where(Resident.email == u_data["email"])).first()
                if not user_exists:
                    target_unit_id = None
                    if u_data["unit"]:
                        u_unit = session.exec(select(Unit).where(Unit.identificador == u_data["unit"])).first()
                        if not u_unit:
                            u_unit = Unit(seccion_id=section.id, identificador=u_data["unit"], tipo="casa")
                            session.add(u_unit)
                            session.commit()
                            session.refresh(u_unit)
                        target_unit_id = u_unit.id

                    new_user = Resident(
                        nombre=u_data["nombre"],
                        email=u_data["email"],
                        password_hash=hash_password(u_data["password"]),
                        telefono="",
                        unidad_id=target_unit_id or unit.id,
                        rol=u_data["rol"]
                    )
                    session.add(new_user)
            session.commit()

        # 4. Crear Votación de Prueba
        if not session.exec(select(Voting)).first():
            session.add(Voting(
                titulo="Cambio de Bomba de Agua",
                descripcion="Se propone cambiar la bomba principal por una de mayor potencia para mejorar la presión en los pisos altos.",
                fecha_fin=datetime.utcnow() + timedelta(days=7),
                monto_propuesto=2500.0
            ))

        # 5. Crear Anuncio en el Mural
        if not session.exec(select(Announcement)).first():
            session.add(Announcement(
                titulo="Mantenimiento de Ascensores",
                mensaje="El día lunes se realizará mantenimiento preventivo al ascensor de la Torre A de 8am a 12pm.",
                tipo="mantenimiento"
            ))

        # 6. Crear una Deuda de Prueba para un residente existente
        resident = session.exec(select(Resident).where(Resident.rol == "propietario")).first()
        if resident and not session.exec(select(Debt).where(Debt.residente_id == resident.id)).first():
            session.add(Debt(
                residente_id=resident.id,
                concepto="Mantenimiento Mensual - Octubre",
                monto_original=50.0,
                monto_pendiente=50.0,
                pagada=False
            ))

        session.commit()

# Incluir Routers
app.include_router(auth.router)
app.include_router(buildings.router)
app.include_router(announcements.router)
app.include_router(accounting.router)
app.include_router(reports.router)
app.include_router(reservations.router)
app.include_router(guests.router)
app.include_router(votings.router)
app.include_router(security_admin.router)

# Wrap ASGI app with Sentry middleware if available
try:
    app = wrap_app_with_sentry(app)
except Exception:
    pass

@app.get("/")
def root():
    return {"message": "Bienvenido a la API de Gestión de Condominio"}

# Endpoint para refrescar token
@app.post("/api/v1/auth/refresh")
def refresh_token(refresh_token: str, session: Session = Depends(get_session)):
    from jose import jwt, JWTError
    from app.core.security import SECRET_KEY, ALGORITHM
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Token de refresco inválido")
        user_id = payload.get("sub")
        new_access, new_refresh = create_tokens(user_id)
        return {"access_token": new_access, "refresh_token": new_refresh}
    except JWTError:
        raise HTTPException(status_code=401, detail="Sesión expirada")

@app.get("/api/v1/stats/overview", dependencies=[Depends(verify_api_key)])
def get_stats(session: Session = Depends(get_session)):
    from sqlmodel import func, select
    from app.models.entities import Building, Section, Unit, Resident

    return {
        "total_edificios": session.exec(select(func.count(Building.id))).one(),
        "total_secciones": session.exec(select(func.count(Section.id))).one(),
        "total_unidades": session.exec(select(func.count(Unit.id))).one(),
        "total_residentes": session.exec(select(func.count(Resident.id))).one()
    }
