import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
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
  ) { }

  async crear(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const { id_rol, id_estado, contraseña, ...datos } = createUsuarioDto;

    // Verificar si el correo ya existe para evitar el error 500 de la BD
    const existe = await this.buscarPorCorreo(datos.correo);
    if (existe) {
      throw new ConflictException('El correo electrónico ya está registrado');
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
    const usuarioCompleto = await this.obtenerPorId(usuarioGuardado.id);
    return usuarioCompleto!;
  }

  async buscarPorCorreo(correo: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { correo },
      relations: ['rol', 'estado'],
    });
  }

  async listar(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.usuarioRepository.findAndCount({
      relations: ['rol', 'estado'],
      take: limit,
      skip: skip,
      order: { nombre: 'ASC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async obtenerPorId(id: number): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { id },
      relations: ['rol', 'estado'],
    });
  }

  async actualizar(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    const usuario = await this.obtenerPorId(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const { id_rol, id_estado, contraseña, ...datos } = updateUsuarioDto;

    // Si se actualiza el correo y es diferente, verificar que no esté en uso
    if (datos.correo && datos.correo !== usuario.correo) {
      const existe = await this.buscarPorCorreo(datos.correo);
      if (existe && existe.id !== id) {
        throw new ConflictException(
          'El correo electrónico ya está registrado por otro usuario',
        );
      }
    }

    // Actualizar campos básicos
    if (datos.nombre !== undefined) {
      usuario.nombre = datos.nombre.trim();
    }
    if (datos.correo !== undefined) {
      usuario.correo = datos.correo.trim();
    }

    // Si se envió una contraseña nueva y válida, cifrarla con bcrypt
    if (contraseña && contraseña.trim().length > 0) {
      const salt = await bcrypt.genSalt();
      usuario.contraseña = await bcrypt.hash(contraseña, salt);
    }

    // Actualizar relaciones
    if (id_rol !== undefined && id_rol !== null) {
      usuario.rol = { id: id_rol } as any;
    }

    if (id_estado !== undefined && id_estado !== null) {
      usuario.estado = { id: id_estado } as any;
    }

    await this.usuarioRepository.save(usuario);

    const usuarioActualizado = await this.obtenerPorId(id);
    return usuarioActualizado!;
  }

  /**
   * Elimina un usuario físicamente de la BD si no tiene historial vinculado.
   * Si tiene ventas, notificaciones o registros asociados (Foreign Key),
   * lo desactiva automáticamente pasándolo a estado Inactivo (id_estado = 2).
   */
  async eliminar(id: number): Promise<{ message: string; desactivado?: boolean }> {
    const usuario = await this.obtenerPorId(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    try {
      // 1. Intentar eliminación física
      await this.usuarioRepository.delete(id);
      return { message: `Usuario #${id} eliminado exitosamente de la base de datos.` };
    } catch (error) {
      // 2. Si MySQL bloquea por clave foránea (ER_ROW_IS_REFERENCED_2), aplicar Soft Delete
      usuario.estado = { id: 2 } as any; // 2 = Inactivo
      await this.usuarioRepository.save(usuario);
      return {
        message: `El usuario #${id} tiene registros históricos vinculados (ventas/notificaciones), por lo que fue desactivado (Inactivo).`,
        desactivado: true,
      };
    }
  }
}
