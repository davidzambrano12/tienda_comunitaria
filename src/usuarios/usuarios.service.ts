import { Injectable } from '@nestjs/common';

@Injectable()
export class UsuariosService {
  private usuarios = [
    { id: 1, nombre: 'David', correo: 'david@gmail.com' },
    { id: 2, nombre: 'Maria', correo: 'maria@gmail.com' },
  ];

  findAll() {
    return this.usuarios;
  }

  findOne(id: string) {
    return this.usuarios.find((usuario) => usuario.id === +id);
  }

  create(data: any) {
    const nuevoUsuario = {
      id: this.usuarios.length + 1,
      ...data,
    };
    this.usuarios.push(nuevoUsuario);
    return nuevoUsuario;
  }

  update(id: string, data: any) {
    const usuario = this.findOne(id);
    if (usuario) {
      Object.assign(usuario, data);
      return usuario;
    }
    return { mensaje: 'Usuario no encontrado' };
  }

  remove(id: string) {
    this.usuarios = this.usuarios.filter((u) => u.id !== +id);
    return { mensaje: 'Usuario eliminado' };
  }
}
