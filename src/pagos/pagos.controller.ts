import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('pagos')
@ApiBearerAuth('access-token')
@Controller('pagos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiResponse({ status: 401, description: 'No autenticado.' })
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @Roles(Role.CAJERO, Role.ADMIN)
  @ApiOperation({ summary: 'Registrar un nuevo pago para una venta' })
  @ApiResponse({ status: 201, description: 'Pago registrado exitosamente.' })
  @ApiResponse({ status: 403, description: 'Solo el CAJERO o ADMIN pueden registrar pagos.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  crear(@Body() createPagoDto: CreatePagoDto, @Req() req: any) {
    return this.pagosService.crear(createPagoDto, req.user.id);
  }

  @Get(':ventaId')
  @Roles(Role.CAJERO, Role.ADMIN, Role.CONTADOR)
  @ApiOperation({ summary: 'Obtener historial de pagos de una venta' })
  @ApiResponse({ status: 200, description: 'Lista de pagos recuperada.' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para ver estos pagos.' })
  obtenerPorVenta(@Param('ventaId') ventaId: number) {
    return this.pagosService.obtenerPorVenta(ventaId);
  }
}
