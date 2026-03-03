import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}
  @Post() crear(@Body() createProductoDto: CreateProductoDto) {
    return this.productosService.crear(createProductoDto);
  }
  @Get() listar() {
    return this.productosService.listar();
  }
  @Get(':id') obtenerPorId(@Param('id') id: number) {
    return this.productosService.obtenerPorId(id);
  }
  @Patch(':id') actualizar(
    @Param('id') id: number,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return this.productosService.actualizar(id, updateProductoDto);
  }
  @Delete(':id') eliminar(@Param('id') id: number) {
    return this.productosService.eliminar(id);
  }
}
