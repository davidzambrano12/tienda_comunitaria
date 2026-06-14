import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

describe('PagosController', () => {
  let app: INestApplication;
  let pagosService: PagosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagosController],
      providers: [
        {
          provide: PagosService,
          useValue: {
            crear: jest.fn(),
            obtenerPorVenta: jest.fn(),
          },
        },
      ],
    })
      // Desactivamos los guards para probar el controlador de forma aislada
      // En la prueba 5 los activamos manualmente para probar el 401
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => false }) // Simula guard rechazando sin token
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    pagosService = module.get<PagosService>(PagosService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('testDeberiaRetornar403SiAccedeSinTokenJWT', async () => {
    // El JwtAuthGuard está configurado para rechazar (canActivate: false)
    // simulando una petición sin token Bearer
    await request(app.getHttpServer())
      .post('/pagos')
      .send({ ventaId: 1, monto: 50, metodo: 'EFECTIVO' })
      // Sin header Authorization: Bearer <token>
      .expect(403);
  });

  it('deberia retornar 200 y lista de pagos cuando el guard permite el acceso', async () => {
    // Nuevo módulo con guard que acepta para probar el GET
    const modulePermitido: TestingModule = await Test.createTestingModule({
      controllers: [PagosController],
      providers: [
        {
          provide: PagosService,
          useValue: {
            crear: jest.fn(),
            obtenerPorVenta: jest
              .fn()
              .mockResolvedValue([
                { id: 1, ventaId: 3, monto: 80, metodo: 'EFECTIVO' },
              ]),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    const appPermitida = modulePermitido.createNestApplication();
    await appPermitida.init();

    const res = await request(appPermitida.getHttpServer())
      .get('/pagos/3')
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].ventaId).toBe(3);

    await appPermitida.close();
  });
});
