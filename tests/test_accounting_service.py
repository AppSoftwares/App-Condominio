import pytest
from datetime import datetime
from sqlmodel import Session, SQLModel, create_engine
from app.models.entities import Debt, Resident, Payment, Unit, Section, Building
from app.services.accounting_service import process_payment

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

def test_process_payment_exact(session: Session):
    # Setup
    debt = Debt(concepto="Cuota", monto_original=100.0, monto_pendiente=100.0)
    session.add(debt)
    session.commit()

    # Execute
    payment = process_payment(session, residente_id=1, deuda_id=debt.id, monto_entregado=100.0)

    # Verify
    assert debt.pagada is True
    assert debt.monto_pendiente == 0
    assert payment.monto_pagado == 100.0
    assert payment.monto_fondo_reserva == 20.0

def test_process_payment_partial(session: Session):
    # Setup
    debt = Debt(concepto="Cuota", monto_original=100.0, monto_pendiente=100.0)
    session.add(debt)
    session.commit()

    # Execute
    payment = process_payment(session, residente_id=1, deuda_id=debt.id, monto_entregado=40.0)

    # Verify
    assert debt.pagada is False
    assert debt.monto_pendiente == 60.0
    assert payment.monto_fondo_reserva == 8.0

def test_process_payment_negative_amount(session: Session):
    # Setup
    debt = Debt(concepto="Cuota", monto_original=100.0, monto_pendiente=100.0)
    session.add(debt)
    session.commit()

    # Execute & Verify
    with pytest.raises(ValueError, match="El monto entregado debe ser positivo"):
        process_payment(session, residente_id=1, deuda_id=debt.id, monto_entregado=-10.0)

def test_process_payment_discount(session: Session):
    # Setup
    # El descuento del 25% se aplica si "Mantenimiento" está en el concepto y es día <= 5
    # Forzamos la fecha en el test si el servicio lo permite, pero process_payment usa datetime.utcnow()
    # Para este test, si hoy no es <= 5, fallaría si no mockeamos datetime.
    # Como no queremos complicar el test con freezegun por ahora, usaremos una lógica que siempre pase si es posible.

    # NOTA: En accounting_service.py, el descuento se calcula así:
    # hoy = datetime.utcnow()
    # if "Mantenimiento" in deuda.concepto and hoy.day <= 5:
    #     monto_a_pagar = deuda.monto_original * 0.75

    debt = Debt(concepto="Mantenimiento Mensual", monto_original=100.0, monto_pendiente=100.0)
    session.add(debt)
    session.commit()

    import datetime as dt
    from unittest.mock import patch

    with patch('app.services.accounting_service.datetime') as mock_date:
        # Simulamos que es día 3 del mes
        mock_date.utcnow.return_value = dt.datetime(2026, 7, 3)
        mock_date.side_effect = lambda *args, **kw: dt.datetime(*args, **kw)

        # Monto con descuento debería ser 75.0
        payment = process_payment(session, residente_id=1, deuda_id=debt.id, monto_entregado=75.0)

        assert debt.pagada is True
        assert debt.monto_pendiente == 0
        assert payment.monto_pagado == 75.0
