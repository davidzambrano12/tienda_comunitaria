import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportesService } from './reportes.service';
import type { GenerarReporteDto } from './reportes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('reportes')
@ApiBearerAuth('access-token')
@Controller('reportes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  /**
   * GET /reportes/pdf-diario
   * Obtiene automáticamente las ventas de hoy de la BD y descarga el PDF.
   */
  @Get('pdf-diario')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.CONTADOR)
  @ApiOperation({ summary: 'Generar y descargar reporte PDF de ventas del día (Microservicio)' })
  @ApiResponse({ status: 200, description: 'Archivo PDF generado con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere Token JWT.' })
  @ApiResponse({ status: 403, description: 'Prohibido - No tienes el rol necesario.' })
  @ApiResponse({ status: 503, description: 'El microservicio de reportes no está disponible.' })
  async generarReporteDiario(@Res() res: Response) {
    const pdfBuffer = await this.reportesService.generarReporteDiarioPDF();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="reporte_diario.pdf"',
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  /**
   * GET /reportes/health
   * Verifica si el microservicio de reportes está disponible.
   */
  @Get('health')
  @ApiOperation({ summary: 'Verificar salud del microservicio de reportes' })
  async checkHealth() {
    const disponible = await this.reportesService.verificarSaludMicroservicio();
    return {
      microservicio_reportes: disponible ? 'disponible' : 'no disponible',
    };
  }
}