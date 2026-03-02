import {Controller,Get,Post,Body,Param,Put,Delete,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Post()
  create(@Body() createUsuarioDto: any) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: any) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }
}
