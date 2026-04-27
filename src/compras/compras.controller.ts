import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('compras')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('compras')
@ApiResponse({ status: 401, description: 'No autenticado.' })
export class ComprasController {

  constructor(private readonly comprasService: ComprasService) {}

  @Post()
  @Roles(Role.ADMIN, Role.INVENTARIO)
  @ApiOperation({ summary: 'Registrar una nueva compra a proveedores (ADMIN o INVENTARIO)' })
  @ApiResponse({ status: 201, description: 'Compra registrada con éxito.' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para registrar compras.' })
  create(@Body() createCompraDto: CreateCompraDto) {
    return this.comprasService.crear(createCompraDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.INVENTARIO, Role.SUPERVISOR, Role.CONTADOR)
  @ApiOperation({ summary: 'Listar todas las compras' })
  @ApiResponse({ status: 200, description: 'Lista de compras recuperada.' })
  listar() {
    return this.comprasService.listar();
  }

}
