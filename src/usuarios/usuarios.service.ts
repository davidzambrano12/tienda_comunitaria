import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
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
    const { id_rol, id_estado, contraseña, ...datos } = createUsuarioDto;

    // Verificar si el correo ya existe para evitar el error 500 de la BD
    const existe = await this.buscarPorCorreo(datos.correo);
    if (existe) {
      throw new Error('El correo electrónico ya está registrado');
    }

    const salt = await bcrypt.genSalt();
    const hashContraseña = await bcrypt.hash(contraseña, salt);
    
    // Creamos la instancia manualmente para asegurar que TypeORM mapee las relaciones
    const nuevoUsuario = this.usuarioRepository.create({
      ...datos,
      contraseña: hashContraseña,
      rol: { id: id_rol } as any,
      estado: { id: id_estado } as any,
    });
    
    const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);
    
    // Devolvemos el usuario buscando sus relaciones para que no salgan null
    return this.buscarPorCorreo(usuarioGuardado.correo);
  }

  async buscarPorCorreo(correo: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { correo },
      relations: ['rol'],
    });
  }

  async listar(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.usuarioRepository.findAndCount({
      relations: ['rol', 'estado'],
      take: limit,
      skip: skip,
      order: { nombre: 'ASC' }
    });

    return {
      data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit)
      }
    };
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