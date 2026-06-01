import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usuariosService: UsuariosService;
  let jwtService: JwtService;
  let auditoriaService: AuditoriaService;
  let notificacionesService: NotificacionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsuariosService,
          useValue: {
            buscarPorCorreo: jest.fn(),
            crear: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('jwt.token.mock'),
          },
        },
        {
          provide: AuditoriaService,
          useValue: {
            registrar: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: NotificacionesService,
          useValue: {
            crear: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usuariosService = module.get<UsuariosService>(UsuariosService);
    jwtService = module.get<JwtService>(JwtService);
    auditoriaService = module.get<AuditoriaService>(AuditoriaService);
    notificacionesService = module.get<NotificacionesService>(NotificacionesService);
  });

  it('testDeberiaLanzarUnauthorizedSiCredencialesInvalidas', async () => {
    // validateUser retorna null cuando las credenciales son incorrectas
    jest.spyOn(service, 'validateUser').mockResolvedValue(null);

    await expect(
      service.login({ correo: 'noexiste@tienda.com', contraseña: 'wrongpass' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('deberia retornar token y datos de usuario si credenciales son correctas', async () => {
    const usuarioMock = {
      id: 1,
      nombre: 'Admin',
      correo: 'admin@tienda.com',
      rol: { nombre: 'ADMIN' },
    };

    jest.spyOn(service, 'validateUser').mockResolvedValue(usuarioMock);

    const resultado = await service.login({
      correo: 'admin@tienda.com',
      contraseña: '123456',
    });

    expect(resultado).toHaveProperty('access_token');
    expect(resultado.user.correo).toBe('admin@tienda.com');
  });
});