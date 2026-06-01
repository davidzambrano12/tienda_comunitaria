// src/reportes/reportes.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportesService } from './reportes.service';
import type { GenerarReporteDto } from './reportes.service';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  /**
   * POST /reportes/ventas
   * El frontend llama a ESTE endpoint del backend principal.
   * El backend principal llama internamente al microservicio.
   * El frontend NUNCA llama directamente al microservicio.
   */
  @Post('ventas')
  @HttpCode(HttpStatus.OK)
  async generarReporteVentas(
    @Body() dto: GenerarReporteDto,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.reportesService.generarReporteVentas(dto);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="reporte_ventas_${dto.fecha_inicio}_${dto.fecha_fin}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  /**
   * GET /reportes/health
   * Verifica si el microservicio de reportes está disponible.
   */
  @Get('health')
  async checkHealth() {
    const disponible = await this.reportesService.verificarSaludMicroservicio();
    return {
      microservicio_reportes: disponible ? 'disponible' : 'no disponible',
    };
  }
}