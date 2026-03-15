import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';

@Controller('ventas')
export class VentasController {

  constructor(private readonly ventasService: VentasService) {}

  @Post()
  crear(@Body() createVentaDto: CreateVentaDto) {
    return this.ventasService.crear(createVentaDto);
  }

  @Get()
  listar() {
    return this.ventasService.listar();
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.ventasService.obtenerPorId(+id);
  }

  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body() updateVentaDto: UpdateVentaDto
  ) {
    return this.ventasService.actualizar(+id, updateVentaDto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.ventasService.eliminar(+id);
  }

}