import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  crear(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.crear(createUsuarioDto);
  }

  @Get()
  listar() {
    return this.usuariosService.listar();
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: number) {
    return this.usuariosService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id') id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.actualizar(id, updateUsuarioDto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: number) {
    return this.usuariosService.eliminar(id);
  }
}