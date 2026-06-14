import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('proveedores')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('proveedores')
@ApiResponse({
  status: 401,
  description: 'No autenticado. Token faltante o inválido.',
})
@ApiResponse({
  status: 403,
  description: 'Prohibido. Se requieren permisos insuficientes.',
})
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  @Roles(Role.ADMIN, Role.INVENTARIO)
  @ApiOperation({ summary: 'Crear un nuevo proveedor' })
  @ApiResponse({ status: 201, description: 'Proveedor creado exitosamente.' })
  create(@Body() createProveedorDto: CreateProveedorDto) {
    console.log('RECIBIDO:', createProveedorDto);
    return this.proveedoresService.create(createProveedorDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.INVENTARIO, Role.SUPERVISOR, Role.CONTADOR)
  @ApiOperation({ summary: 'Listar todos los proveedores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de proveedores recuperada con éxito.',
  })
  findAll() {
    return this.proveedoresService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.INVENTARIO, Role.SUPERVISOR, Role.CONTADOR)
  @ApiOperation({ summary: 'Obtener un proveedor por ID' })
  @ApiResponse({ status: 200, description: 'Proveedor encontrado.' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.proveedoresService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.INVENTARIO)
  @ApiOperation({ summary: 'Actualizar un proveedor' })
  @ApiResponse({
    status: 200,
    description: 'Proveedor actualizado correctamente.',
  })
  update(
    @Param('id') id: string,
    @Body() updateProveedorDto: UpdateProveedorDto,
  ) {
    return this.proveedoresService.update(+id, updateProveedorDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar un proveedor' })
  @ApiResponse({
    status: 200,
    description: 'Proveedor eliminado exitosamente.',
  })
  remove(@Param('id') id: string) {
    return this.proveedoresService.remove(+id);
  }
}
