from datetime import datetime
from sqlmodel import Session, select
from app.models.entities import Resident, Debt, Payment

def create_massive_debt(session: Session, concepto: str, monto: float, seccion_id: int = None):
    """Genera una deuda para todos los residentes o por sección"""
    statement = select(Resident)
    if seccion_id:
        from app.models.entities import Unit
        statement = statement.join(Unit).where(Unit.seccion_id == seccion_id)

    residents = session.exec(statement).all()

    for res in residents:
        nueva_deuda = Debt(
            residente_id=res.id,
            concepto=concepto,
            monto_original=monto,
            monto_pendiente=monto,
            fecha_vencimiento=None # Opcional definir una fecha
        )
        session.add(nueva_deuda)

    session.commit()
    return len(residents)

def process_payment(session: Session, residente_id: int, deuda_id: int, monto_entregado: float):
    """Procesa un pago calculando el 20% para fondo de reserva y verificando descuentos"""
    deuda = session.get(Debt, deuda_id)
    if not deuda or deuda.pagada:
        return None

    # Lógica de descuento del 25% si es antes del día 5 (solo para cuotas mensuales específicas)
    # Aquí asumimos que el descuento se aplica si el pago ocurre en los primeros 5 días del mes
    hoy = datetime.utcnow()
    monto_a_pagar = deuda.monto_pendiente

    # Ejemplo: Si el concepto es 'Mantenimiento Mensual' y es antes del día 5
    if "Mantenimiento" in deuda.concepto and hoy.day <= 5:
        monto_a_pagar = deuda.monto_original * 0.75 # 25% desc

    # 20% siempre va al fondo de reserva
    fondo_reserva = monto_entregado * 0.20

    pago = Payment(
        residente_id=residente_id,
        deuda_id=deuda_id,
        monto_pagado=monto_entregado,
        monto_fondo_reserva=fondo_reserva
    )

    if monto_entregado >= monto_a_pagar:
        deuda.pagada = True
        deuda.monto_pendiente = 0
    else:
        deuda.monto_pendiente -= monto_entregado

    session.add(pago)
    session.add(deuda)
    session.commit()
    session.refresh(pago)
    return pago

def migrate_historical_debt(session: Session, identificador_unidad: str, concepto: str, monto_total: float, fecha_corte: datetime = None):
    """
    Carga una deuda histórica para una unidad específica (casa/apartamento).
    La deuda queda vinculada a la unidad, incluso si el residente aún no se registra.
    """
    from app.models.entities import Unit, Resident

    # 1. Buscar la unidad por su identificador (ej: '14-28')
    statement = select(Unit).where(Unit.identificador == identificador_unidad)
    unit = session.exec(statement).first()

    if not unit:
        return {"error": f"No se encontró la unidad {identificador_unidad}"}

    # 2. Buscar si ya hay un residente para vincularlo (opcional)
    residente = session.exec(select(Resident).where(Resident.unidad_id == unit.id)).first()

    # 3. Crear la deuda de migración vinculada a la UNIDAD
    deuda_migrada = Debt(
        unidad_id=unit.id,
        residente_id=residente.id if residente else None,
        concepto=concepto,
        monto_original=monto_total,
        monto_pendiente=monto_total,
        fecha_creacion=fecha_corte or datetime.utcnow()
    )

    session.add(deuda_migrada)
    session.commit()
    session.refresh(deuda_migrada)

    return {"success": True, "unidad": identificador_unidad, "deuda_id": deuda_migrada.id}
