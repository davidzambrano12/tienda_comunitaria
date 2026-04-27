import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          'Token inválido o no proporcionado. Por favor, inicie sesión y use un token JWT válido.',
        )
      );
    }
    return user;
  }
}
