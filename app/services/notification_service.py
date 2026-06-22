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
