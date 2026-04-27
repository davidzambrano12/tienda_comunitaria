import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('productos')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('productos')
@ApiResponse({ status: 401, description: 'No autenticado.' })
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @Roles(Role.ADMIN, Role.INVENTARIO)
  @ApiOperation({ summary: 'Crear un nuevo producto (ADMIN o INVENTARIO)' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente.' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para crear productos.' })
  crear(@Body() createProductoDto: CreateProductoDto) {
    return this.productosService.crear(createProductoDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.INVENTARIO, Role.CAJERO, Role.SUPERVISOR, Role.CONTADOR)
  @ApiOperation({ summary: 'Listar todos los productos' })
  @ApiResponse({ status: 200, description: 'Lista de productos obtenida.' })
  listar() {
    return this.productosService.listar();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.INVENTARIO, Role.CAJERO, Role.SUPERVISOR, Role.CONTADOR)
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiResponse({ status: 200, description: 'Producto encontrado.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  obtenerPorId(@Param('id') id: number) {
    return this.productosService.obtenerPorId(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.INVENTARIO)
  @ApiOperation({ summary: 'Actualizar un producto (ADMIN o INVENTARIO)' })
  @ApiResponse({ status: 200, description: 'Producto actualizado.' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para editar productos.' })
  actualizar(
    @Param('id') id: number,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return this.productosService.actualizar(id, updateProductoDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar un producto (Solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Producto eliminado.' })
  @ApiResponse({ status: 403, description: 'Solo el administrador puede eliminar productos.' })
  eliminar(@Param('id') id: number) {
    return this.productosService.eliminar(id);
  }
}
