import pandas as pd
from io import BytesIO
from fpdf import FPDF
from sqlmodel import Session, select
from app.models.entities import Resident, Debt, Payment
from datetime import datetime

def generate_financial_excel(session: Session):
    """Genera un reporte Excel con el estado de deudas y pagos"""
    # 1. Obtener datos de deudas
    statement = select(Resident.nombre, Resident.email, Debt.concepto, Debt.monto_original, Debt.monto_pendiente, Debt.pagada)
    statement = statement.join(Debt)
    results = session.exec(statement).all()

    # 2. Convertir a DataFrame
    df = pd.DataFrame([
        {
            "Residente": r.nombre,
            "Email": r.email,
            "Concepto": r.concepto,
            "Monto Total": r.monto_original,
            "Pendiente": r.monto_pendiente,
            "Estado": "Pagado" if r.pagada else "Pendiente"
        } for r in results
    ])

    # 3. Guardar en memoria
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Estado de Deudas')

    return output.getvalue()

def generate_financial_pdf(session: Session):
    """Genera un reporte PDF simplificado"""
    statement = select(Payment).order_by(Payment.fecha_pago.desc())
    payments = session.exec(statement).all()

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, txt="Reporte de Ingresos - Caminos de la Lagunita", ln=True, align='C')
    pdf.set_font("Arial", size=10)
    pdf.ln(10)

    # Cabecera
    pdf.cell(40, 10, "Fecha", 1)
    pdf.cell(80, 10, "Monto Pagado", 1)
    pdf.cell(60, 10, "Fondo Reserva (20%)", 1)
    pdf.ln()

    total_recaudado = 0
    total_reserva = 0

    for p in payments:
        pdf.cell(40, 10, p.fecha_pago.strftime("%Y-%m-%d"), 1)
        pdf.cell(80, 10, f"${p.monto_pagado}", 1)
        pdf.cell(60, 10, f"${p.monto_fondo_reserva}", 1)
        pdf.ln()
        total_recaudado += p.monto_pagado
        total_reserva += p.monto_fondo_reserva

    pdf.ln(5)
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 10, f"Total Recaudado: ${total_recaudado}", ln=True)
    pdf.cell(0, 10, f"Total en Fondo de Reserva: ${total_reserva}", ln=True)

    return pdf.output(dest='S').encode('latin-1')

def generate_individual_debt_pdf(session: Session, resident_id: int):
    """Genera un PDF con la deuda de un residente específico"""
    resident = session.get(Resident, resident_id)
    if not resident:
        return None

    statement = select(Debt).where(Debt.residente_id == resident_id, Debt.pagada == False)
    debts = session.exec(statement).all()

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, txt=f"Estado de Cuenta - {resident.nombre}", ln=True, align='C')
    pdf.set_font("Arial", size=11)
    pdf.ln(10)

    pdf.cell(0, 10, f"Email: {resident.email}", ln=True)
    pdf.cell(0, 10, f"Teléfono: {resident.telefono}", ln=True)
    pdf.ln(5)

    # Cabecera Tabla
    pdf.set_font("Arial", 'B', 10)
    pdf.cell(100, 10, "Concepto", 1)
    pdf.cell(40, 10, "Monto Original", 1)
    pdf.cell(40, 10, "Pendiente", 1)
    pdf.ln()

    pdf.set_font("Arial", size=10)
    total_pendiente = 0
    for d in debts:
        pdf.cell(100, 10, d.concepto, 1)
        pdf.cell(40, 10, f"${d.monto_original}", 1)
        pdf.cell(40, 10, f"${d.monto_pendiente}", 1)
        pdf.ln()
        total_pendiente += d.monto_pendiente

    pdf.ln(5)
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 10, f"TOTAL PENDIENTE DE PAGO: ${total_pendiente}", ln=True)

    return pdf.output(dest='S').encode('latin-1')

def get_transparency_summary(session: Session, mes: int, anio: int):
    """Calcula el resumen financiero para el dashboard de transparencia"""
    from sqlalchemy import func, extract
    from app.models.entities import Expense

    # 1. Ingresos y Fondo Reserva del mes
    statement_payments = select(
        func.sum(Payment.monto_pagado).label("total_ingresos"),
        func.sum(Payment.monto_fondo_reserva).label("total_reserva")
    ).where(
        extract('month', Payment.fecha_pago) == mes,
        extract('year', Payment.fecha_pago) == anio
    )
    payments_res = session.exec(statement_payments).first()

    total_ingresos = payments_res.total_ingresos or 0
    total_reserva_mes = payments_res.total_reserva or 0

    # 2. Gastos del mes
    statement_expenses = select(func.sum(Expense.monto)).where(
        extract('month', Expense.fecha) == mes,
        extract('year', Expense.fecha) == anio
    )
    total_gastos = session.exec(statement_expenses).first() or 0

    # 3. Estado de residentes
    total_residentes = session.exec(select(func.count(Resident.id))).one()
    residentes_con_deuda = session.exec(
        select(func.count(func.distinct(Debt.residente_id)))
        .where(Debt.pagada == False)
    ).one()

    porcentaje_al_dia = 0
    if total_residentes > 0:
        porcentaje_al_dia = ((total_residentes - residentes_con_deuda) / total_residentes) * 100

    return {
        "mes": mes,
        "anio": anio,
        "total_ingresos": float(total_ingresos),
        "total_reserva_mes": float(total_reserva_mes),
        "total_gastos": float(total_gastos),
        "balance_neto": float(total_ingresos - total_gastos),
        "porcentaje_al_dia": round(porcentaje_al_dia, 2),
        "total_residentes": total_residentes
    }
