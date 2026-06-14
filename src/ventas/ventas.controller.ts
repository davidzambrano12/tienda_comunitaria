import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, Query, ParseIntPipe } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('ventas')
@ApiBearerAuth('access-token')
@Controller('ventas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  @Roles(Role.CAJERO, Role.ADMIN)
  crear(@Body() createVentaDto: CreateVentaDto, @Req() req: any) {
    return this.ventasService.crear(createVentaDto, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.CONTADOR, Role.CAJERO)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listar(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.ventasService.listar(page || 1, limit || 10);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.CONTADOR, Role.CAJERO)
  obtenerPorId(@Param('id') id: number) {
    return this.ventasService.obtenerPorId(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  actualizar(
    @Param('id') id: number,
    @Body() updateVentaDto: UpdateVentaDto,
  ) {
    return this.ventasService.actualizar(id, updateVentaDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  eliminar(@Param('id') id: number) {
    return this.ventasService.eliminar(id);
  }
}