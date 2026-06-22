import os
from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session
from app.core.database import get_session, init_db
from app.core.security import create_tokens, verify_api_key
from app.routers import buildings, announcements, accounting, reports, reservations, guests, votings, security_admin, auth

app = FastAPI(title="Caminos de la Lagunita API")

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

        # 3. Crear Usuarios Iniciales (Producción - Contraseñas desde Variables de Entorno)
        initial_users = [
            {"nombre": "JESÚS ADMIN", "email": "admin@caminos.com", "password": os.getenv("INITIAL_ADMIN_PASSWORD", "ADMIN_PWD_TODO"), "rol": "admin", "unit": None},
            {"nombre": "CARLOS PIRELA", "email": "ofi.pirela@gmail.com", "password": os.getenv("INITIAL_CARLOS_PASSWORD", "CARLOS_PWD_TODO"), "rol": "propietario", "unit": "14-28"},
            {"nombre": "JESÚS PIRELA", "email": "jess.pirela@gmail.com", "password": os.getenv("INITIAL_JESUS_PASSWORD", "JESUS_PWD_TODO"), "rol": "propietario", "unit": "14-28"},
            {"nombre": "JESÚS VIGILANTE", "email": "vigilante@caminos.com", "password": os.getenv("INITIAL_VIGILANTE_PASSWORD", "VIGILANTE_PWD_TODO"), "rol": "vigilante", "unit": None},
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
                    password_hash=u_data["password"], # Idealmente hashear en prod real
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

        # 6. Crear una Deuda de Prueba para el residente
        if not session.exec(select(Debt).where(Debt.residente_id == resident.id)).first():
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
