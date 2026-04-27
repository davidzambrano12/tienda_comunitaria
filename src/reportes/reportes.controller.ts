import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('reportes')
@ApiBearerAuth('access-token')
@Controller('reportes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiResponse({ status: 401, description: 'Token de acceso inválido o expirado.' })
@ApiResponse({ status: 403, description: 'Permisos insuficientes para ver reportes.' })
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('ventas-diarias')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.CONTADOR)
  @ApiOperation({ summary: 'Resumen de ventas del día actual' })
  @ApiResponse({ status: 200, description: 'Datos del día obtenidos con éxito.' })
  ventasDiarias() {
    return this.reportesService.ventasDiarias();
  }

  @Get('ventas-por-fecha')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.CONTADOR)
  @ApiOperation({ summary: 'Ventas agrupadas por fecha en un rango' })
  @ApiResponse({ status: 200, description: 'Reporte generado.' })
  ventasPorFecha(@Query('inicio') inicio: string, @Query('fin') fin: string) {
    return this.reportesService.ventasPorFecha(inicio, fin);
  }

  @Get('productos-mas-vendidos')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Top 10 productos más vendidos' })
  productosMasVendidos() {
    return this.reportesService.productosMasVendidos();
  }

  @Get('ingresos-totales')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.CONTADOR)
  @ApiOperation({ summary: 'Acumulado histórico de ingresos' })
  ingresosTotales() {
    return this.reportesService.ingresosTotales();
  }
}
