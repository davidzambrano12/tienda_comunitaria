import tempfile

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch
import datetime
import os
import uuid

app = FastAPI(title="Microservicio de Reportes - Tienda Comunitaria", version="1.0.0")

# ─── Modelos de datos ───────────────────────────────────────────────────────

class DetalleVenta(BaseModel):
    producto: str
    cantidad: int
    subtotal: float

class Venta(BaseModel):
    id: int
    fecha: str
    cajero: str
    total: float
    detalles: List[DetalleVenta]

class ReporteRequest(BaseModel):
    titulo: Optional[str] = "Reporte de Ventas"
    fecha_inicio: str
    fecha_fin: str
    ventas: List[Venta]

# ─── Endpoint principal ─────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {"status": "ok", "servicio": "microservicio-reportes"}


@app.post("/reportes/ventas")
def generar_reporte_ventas(request: ReporteRequest):
    """
    Genera un PDF con el reporte de ventas y lo retorna como archivo descargable.
    """
    try:
        # Nombre de archivo único para evitar colisiones
        file_name = f"reporte_{uuid.uuid4().hex[:8]}.pdf"
        file_path = os.path.join(tempfile.gettempdir(), file_name)

        doc = SimpleDocTemplate(
            file_path,
            pagesize=letter,
            rightMargin=0.75 * inch,
            leftMargin=0.75 * inch,
            topMargin=0.75 * inch,
            bottomMargin=0.75 * inch,
        )

        styles = getSampleStyleSheet()
        story = []

        # ── Título ──────────────────────────────────────────────────────────
        titulo_style = ParagraphStyle(
            "TituloReporte",
            parent=styles["Title"],
            fontSize=20,
            textColor=colors.HexColor("#1E3A5F"),
            spaceAfter=6,
        )
        story.append(Paragraph(request.titulo, titulo_style))

        # ── Subtítulo con fechas ─────────────────────────────────────────────
        subtitulo_style = ParagraphStyle(
            "Subtitulo",
            parent=styles["Normal"],
            fontSize=10,
            textColor=colors.HexColor("#666666"),
            spaceAfter=16,
        )
        story.append(
            Paragraph(
                f"Período: {request.fecha_inicio} al {request.fecha_fin} &nbsp;|&nbsp; "
                f"Generado: {datetime.datetime.now().strftime('%d/%m/%Y %H:%M')}",
                subtitulo_style,
            )
        )

        # ── Tabla resumen de ventas ──────────────────────────────────────────
        encabezado = [["# Venta", "Fecha", "Cajero", "Total"]]
        filas = [
            [str(v.id), v.fecha, v.cajero, f"${v.total:,.2f}"]
            for v in request.ventas
        ]
        total_general = sum(v.total for v in request.ventas)
        filas_total = [["", "", "TOTAL GENERAL", f"${total_general:,.2f}"]]

        tabla_data = encabezado + filas + filas_total

        tabla = Table(tabla_data, colWidths=[1 * inch, 1.8 * inch, 2.5 * inch, 1.5 * inch])
        tabla.setStyle(
            TableStyle(
                [
                    # Encabezado
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E3A5F")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 11),
                    ("ALIGN", (0, 0), (-1, 0), "CENTER"),
                    # Cuerpo
                    ("FONTNAME", (0, 1), (-1, -2), "Helvetica"),
                    ("FONTSIZE", (0, 1), (-1, -2), 10),
                    ("ALIGN", (3, 1), (3, -1), "RIGHT"),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, colors.HexColor("#EEF3FA")]),
                    # Fila total
                    ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#D9E4F0")),
                    ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, -1), (-1, -1), 11),
                    ("ALIGN", (2, -1), (-1, -1), "RIGHT"),
                    # Bordes
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#AAAAAA")),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ]
            )
        )
        story.append(tabla)
        story.append(Spacer(1, 0.3 * inch))

        # ── Detalle de cada venta ────────────────────────────────────────────
        seccion_style = ParagraphStyle(
            "Seccion",
            parent=styles["Heading2"],
            fontSize=12,
            textColor=colors.HexColor("#1E3A5F"),
            spaceAfter=6,
            spaceBefore=14,
        )

        for venta in request.ventas:
            story.append(
                Paragraph(
                    f"Venta #{venta.id} — {venta.fecha} | Cajero: {venta.cajero}",
                    seccion_style,
                )
            )

            detalle_data = [["Producto", "Cantidad", "Subtotal"]] + [
                [d.producto, str(d.cantidad), f"${d.subtotal:,.2f}"]
                for d in venta.detalles
            ]

            detalle_tabla = Table(
                detalle_data, colWidths=[3.5 * inch, 1.5 * inch, 1.8 * inch]
            )
            detalle_tabla.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2E86AB")),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, 0), 10),
                        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
                        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                        ("FONTSIZE", (0, 1), (-1, -1), 9),
                        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F8FF")]),
                        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#BBBBBB")),
                        ("TOPPADDING", (0, 0), (-1, -1), 5),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                        ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ]
                )
            )
            story.append(detalle_tabla)
            story.append(Spacer(1, 0.15 * inch))

        doc.build(story)

        return FileResponse(
            path=file_path,
            media_type="application/pdf",
            filename=f"reporte_ventas_{request.fecha_inicio}_{request.fecha_fin}.pdf",
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando reporte: {str(e)}")