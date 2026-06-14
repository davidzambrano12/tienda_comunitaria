import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SECRET_KEY_TIENDA_2026', // En producción usar variables de entorno
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      correo: payload.correo,
      rol: payload.rol,
    };
  }
}
