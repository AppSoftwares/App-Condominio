from typing import Optional, List
from sqlmodel import Session, select
from app.models.entities import Resident, Unit, Debt
# import firebase_admin
# from firebase_admin import messaging

def send_push_to_devices(tokens: List[str], titulo: str, mensaje: str):
    if not tokens:
        return
    print(f"ENVIANDO PUSH a {len(tokens)} dispositivos. Titulo: {titulo}")
    # Aquí iría la lógica de firebase-admin
    # message = messaging.MulticastMessage(
    #     notification=messaging.Notification(title=titulo, body=mensaje),
    #     tokens=tokens
    # )
    # response = messaging.send_multicast(message)

def send_push_to_section(session: Session, seccion_id: Optional[int], titulo: str, mensaje: str):
    if seccion_id is None:
        statement = select(Resident.fcm_token).where(Resident.fcm_token != None)
    else:
        statement = (
            select(Resident.fcm_token)
            .join(Unit)
            .where(Unit.seccion_id == seccion_id, Resident.fcm_token != None)
        )
    tokens = session.exec(statement).all()
    send_push_to_devices(tokens, titulo, mensaje)

def notify_early_payment_discount(session: Session):
    """Mensaje de inicio de mes: 25% desc antes del día 5"""
    titulo = "¡Ahorra un 25% en tu mensualidad!"
    mensaje = "Paga antes del día 5 de este mes y obtén un 25% de descuento en tu cuota de mantenimiento."
    # Solo a propietarios
    statement = select(Resident.fcm_token).where(Resident.rol == "propietario", Resident.fcm_token != None)
    tokens = session.exec(statement).all()
    send_push_to_devices(tokens, titulo, mensaje)

def notify_defaulters(session: Session):
    """Notificación solo a los que tienen deudas pendientes"""
    statement = (
        select(Resident)
        .join(Debt)
        .where(Debt.pagada == False, Resident.fcm_token != None)
        .distinct()
    )
    morosos = session.exec(statement).all()

    for m in morosos:
        send_push_to_devices([m.fcm_token], "Recordatorio de Pago", f"Hola {m.nombre}, tienes deudas pendientes. Evita cargos adicionales.")

def notify_event(session: Session, tipo: str, residente_id: Optional[int], payload: dict):
    """Función genérica para notificar eventos"""
    if residente_id:
        residente = session.get(Resident, residente_id)
        tokens = [residente.fcm_token] if residente and residente.fcm_token else []
    else:
        # Si no hay residente_id, se asume notificación global
        tokens = session.exec(select(Resident.fcm_token).where(Resident.fcm_token != None)).all()

    if not tokens:
        return

    titulo = ""
    mensaje = ""

    if tipo == "payment_approved":
        titulo = "✅ Pago Aprobado"
        mensaje = "Tu reporte de pago ha sido validado correctamente."
    elif tipo == "payment_rejected":
        titulo = "❌ Pago Rechazado"
        mensaje = f"Tu reporte de pago fue rechazado. Motivo: {payload.get('motivo', 'No especificado')}"
    elif tipo == "new_voting":
        titulo = "🗳️ Nueva Votación"
        mensaje = f"Se ha publicado una nueva propuesta: {payload.get('titulo')}. ¡Tu voto cuenta!"
    elif tipo == "package_received":
        titulo = "📦 Paquete en Portería"
        mensaje = f"Has recibido un paquete de {payload.get('courier', 'un courier')}. Retíralo con tu código QR."
    elif tipo == "visit_announced":
        titulo = "👤 Visita Anunciada"
        mensaje = f"El residente de la casa {payload.get('casa')} ha anunciado una visita: {payload.get('visitante')}."

    if titulo and mensaje:
        send_push_to_devices(tokens, titulo, mensaje)
