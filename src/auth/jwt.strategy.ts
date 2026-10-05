import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SECRET_KEY_TIENDA_2026',
    });
  }

  async validate(payload: any) {
    const user = await this.usuarioRepository.findOne({
      where: { id: payload.sub },
      relations: ['rol', 'estado'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Si alguien inició sesión en otro computador, el currentSessionId de la BD cambió
    if (user.currentSessionId && user.currentSessionId !== payload.sessionId) {
      throw new UnauthorizedException({
        code: 'SESSION_REVOKED',
        message: 'Tu sesión ha sido iniciada en otro dispositivo o navegador.',
      });
    }

    return {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      email: user.correo,
      rol: user.rol ? user.rol.nombre : payload.rol || 'SIN_ROL',
      currentSessionId: user.currentSessionId,
    };
  }
}
