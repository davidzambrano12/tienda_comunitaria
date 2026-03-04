import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async crear(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const usuario = this.usuarioRepository.create(createUsuarioDto);
    return this.usuarioRepository.save(usuario);
  }

  async listar(): Promise<Usuario[]> {
    return this.usuarioRepository.find();
  }

  async obtenerPorId(id: number): Promise<Usuario | null> {
    return this.usuarioRepository.findOneBy({ id });
  }

  async actualizar(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario | null> {
    await this.usuarioRepository.update(id, updateUsuarioDto);
    return this.obtenerPorId(id);
  }

  async eliminar(id: number): Promise<void> {
    await this.usuarioRepository.delete(id);
  }
}