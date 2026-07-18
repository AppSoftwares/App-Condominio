from datetime import datetime
from enum import Enum
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship, JSON
from sqlalchemy import UniqueConstraint

class ExpenseCategory(str, Enum):
    MANTENIMIENTO = "mantenimiento"
    JARDINERIA = "jardinero"
    LIMPIEZA = "limpieza"
    LUZ_COMUN = "luz_comunes"
    SEGURIDAD = "seguridad"
    CAMARAS = "camaras"
    REPARACIONES = "reparaciones"
    EMERGENCIAS = "emergencias"
    IMPREVISTOS = "imprevistos"

class Building(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    direccion: str
    cantidad_pisos: int
    cantidad_torres: int
    cantidad_apartamentos: int
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)

    sections: List["Section"] = Relationship(back_populates="building")

class Section(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    edificio_id: int = Field(foreign_key="building.id")
    nombre: str
    tipo: str  # "torre" | "calle"
    cantidad_pisos: Optional[int] = None

    building: "Building" = Relationship(back_populates="sections")
    units: List["Unit"] = Relationship(back_populates="section")

class Unit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    seccion_id: int = Field(foreign_key="section.id")
    identificador: str
    tipo: str  # "casa" | "apartamento"
    piso: Optional[int] = None

    section: "Section" = Relationship(back_populates="units")
    residents: List["Resident"] = Relationship(back_populates="unit")

class Resident(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str = Field(unique=True, index=True)
    password_hash: str
    telefono: str
    unidad_id: int = Field(foreign_key="unit.id")
    rol: str  # "propietario" | "inquilino" | "admin" | "vigilante"
    fcm_token: Optional[str] = None

    unit: "Unit" = Relationship(back_populates="residents")
    debts: List["Debt"] = Relationship(back_populates="resident")
    reservations: List["Reservation"] = Relationship(back_populates="resident")
    guests: List["GuestAccess"] = Relationship(back_populates="resident")

class Announcement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str
    mensaje: str
    tipo: str  # "mantenimiento", "general", "emergencia", "reserva"
    seccion_id: Optional[int] = Field(default=None, foreign_key="section.id")
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    fecha_expiracion: Optional[datetime] = None

class ApiKey(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre_cliente: str
    key_hash: str = Field(index=True)
    activo: bool = Field(default=True)
    permisos: List[str] = Field(default=[], sa_type=JSON)
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)

class Expense(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    monto: float
    categoria: ExpenseCategory
    descripcion: str
    fecha: datetime = Field(default_factory=datetime.utcnow)

class Debt(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    residente_id: Optional[int] = Field(default=None, foreign_key="resident.id")
    unidad_id: Optional[int] = Field(default=None, foreign_key="unit.id")
    concepto: str
    monto_original: float
    monto_pendiente: float
    pagada: bool = Field(default=False)
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    fecha_vencimiento: Optional[datetime] = None

    resident: Optional["Resident"] = Relationship(back_populates="debts")
    unit: Optional["Unit"] = Relationship()

class Payment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    residente_id: int = Field(foreign_key="resident.id")
    deuda_id: int = Field(foreign_key="debt.id")
    monto_pagado: float
    monto_fondo_reserva: float
    fecha_pago: datetime = Field(default_factory=datetime.utcnow)

class Amenity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    capacidad: int

    reservations: List["Reservation"] = Relationship(back_populates="amenity")

class Reservation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    amenity_id: int = Field(foreign_key="amenity.id")
    residente_id: int = Field(foreign_key="resident.id")
    fecha_hora: datetime
    duracion_horas: int = Field(default=2)
    aprobada: bool = Field(default=True)

    amenity: "Amenity" = Relationship(back_populates="reservations")
    resident: "Resident" = Relationship(back_populates="reservations")

class GuestAccess(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    residente_id: int = Field(foreign_key="resident.id")
    nombre_invitado: str
    identificacion: Optional[str] = None
    fecha_visita: datetime
    token_qr: str = Field(index=True)
    ingreso_confirmado: bool = Field(default=False)
    fecha_ingreso_efectiva: Optional[datetime] = None
    observaciones: Optional[str] = None

    resident: "Resident" = Relationship(back_populates="guests")

class Voting(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str
    descripcion: str
    fecha_inicio: datetime = Field(default_factory=datetime.utcnow)
    fecha_fin: datetime
    activa: bool = Field(default=True)
    monto_propuesto: Optional[float] = None

    votes: List["VoteRecord"] = Relationship(back_populates="voting")

class VoteRecord(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("voting_id", "residente_id", name="uq_vote_per_resident"),)
    id: Optional[int] = Field(default=None, primary_key=True)
    voting_id: int = Field(foreign_key="voting.id")
    residente_id: int = Field(foreign_key="resident.id")
    opcion: str # "favor" | "contra"
    fecha: datetime = Field(default_factory=datetime.utcnow)

    voting: "Voting" = Relationship(back_populates="votes")

class UserMetric(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    evento: str
    residente_id: Optional[int] = Field(foreign_key="resident.id")
    fecha: datetime = Field(default_factory=datetime.utcnow)
    metadata_json: Optional[dict] = Field(default={}, sa_type=JSON)
