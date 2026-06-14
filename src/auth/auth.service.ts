import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly auditoriaService: AuditoriaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async validateUser(correo: string, pass: string): Promise<any> {
    const usuario = await this.usuariosService.buscarPorCorreo(correo);

    if (usuario && (await bcrypt.compare(pass, usuario.contraseña))) {
      const { contraseña, ...result } = usuario;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.correo, loginDto.contraseña);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      correo: user.correo,
      rol: user.rol ? user.rol.nombre : 'SIN_ROL',
    };

    // Log auditoría y notificación
    await this.auditoriaService.registrar(user.id, 'LOGIN', 'AUTH');
    await this.notificacionesService.crear(
      `Usuario ${user.nombre} ha iniciado sesión`,
      'INFO',
      user.id,
    );

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol ? user.rol.nombre : 'SIN_ROL',
      },
    };
  }

  async register(registerDto: RegisterDto) {
    try {
      const usuario = await this.usuariosService.crear({
        nombre: registerDto.nombre,
        correo: registerDto.correo,
        contraseña: registerDto.contraseña,
        id_rol: registerDto.id_rol || 2, // Por defecto CAJERO si no se envía
        id_estado: registerDto.id_estado || 1, // Por defecto ACTIVO
      });

      await this.notificacionesService.crear(
        `Nuevo usuario registrado: ${usuario.nombre}`,
        'EVENTO',
        usuario.id,
      );

      const { contraseña, ...result } = usuario;
      return result;
    } catch (error) {
      throw new ConflictException(error.message);
    }
  }
}
