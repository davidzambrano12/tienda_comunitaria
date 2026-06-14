import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let app: INestApplication;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    // ValidationPipe para que los decoradores @IsEmail, @MinLength etc. funcionen
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('testDeberiaRetornarTokenYDatosAlLoginExitoso', async () => {
    const loginRespuestaMock = {
      access_token: 'jwt.token.aqui',
      user: {
        id: 1,
        nombre: 'Admin',
        correo: 'admin@tienda.com',
        rol: 'ADMIN',
      },
    };

    jest.spyOn(authService, 'login').mockResolvedValue(loginRespuestaMock);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correo: 'admin@tienda.com', contraseña: '123456' })
      .expect(200);

    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.correo).toBe('admin@tienda.com');
  });

  it('deberia retornar 400 si el body esta vacio', async () => {
    await request(app.getHttpServer()).post('/auth/login').send({}).expect(400);
  });
});
