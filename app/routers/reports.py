from fastapi import APIRouter, Depends, Response
from sqlmodel import Session
from app.core.database import get_session
from app.core.security import get_current_admin
from app.services.report_service import generate_financial_excel, generate_financial_pdf

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])

@router.get("/excel", dependencies=[Depends(get_current_admin)])
def download_excel(session: Session = Depends(get_session)):
    file_data = generate_financial_excel(session)
    return Response(
        content=file_data,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=reporte_financiero.xlsx"}
    )

@router.get("/pdf", dependencies=[Depends(get_current_admin)])
def download_pdf(session: Session = Depends(get_session)):
    file_data = generate_financial_pdf(session)
    return Response(
        content=file_data,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=reporte_ingresos.pdf"}
    )
