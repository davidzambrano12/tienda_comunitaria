import { Test, TestingModule } from '@nestjs/testing';
import { PagosService } from './pagos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pago, MetodoPago } from './entities/pago.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { Repository } from 'typeorm';

describe('PagosService', () => {
  let service: PagosService;
  let pagoRepository: Repository<Pago>;
  let auditoriaService: AuditoriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagosService,
        {
          // Así se mockea un repositorio de TypeORM en NestJS
          provide: getRepositoryToken(Pago),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: AuditoriaService,
          useValue: {
            registrar: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<PagosService>(PagosService);
    pagoRepository = module.get<Repository<Pago>>(getRepositoryToken(Pago));
    auditoriaService = module.get<AuditoriaService>(AuditoriaService);
  });

  it('testDeberiaCrearPagoYRegistrarAuditoria', async () => {
    const pagoMock: Pago = {
      id: 1,
      ventaId: 5,
      monto: 100,
      metodo: MetodoPago.EFECTIVO,
      fecha: new Date(),
      venta: null,
    };

    jest.spyOn(pagoRepository, 'create').mockReturnValue(pagoMock);
    jest.spyOn(pagoRepository, 'save').mockResolvedValue(pagoMock);

    const resultado = await service.crear(
      { ventaId: 5, monto: 100, metodo: MetodoPago.EFECTIVO },
      1, // usuarioId
    );

    // Verifica que el pago se guardó correctamente
    expect(resultado).toEqual(pagoMock);

    // Verifica que se registró la auditoría con los datos correctos
    expect(auditoriaService.registrar).toHaveBeenCalledWith(
      1,
      'REGISTRO_PAGO',
      'PAGOS',
      { pagoId: 1, ventaId: 5 },
    );
  });

  it('deberia retornar lista de pagos de una venta ordenados por fecha', async () => {
    const pagosMock: Pago[] = [
      { id: 2, ventaId: 5, monto: 50, metodo: MetodoPago.TARJETA, fecha: new Date(), venta: null },
      { id: 1, ventaId: 5, monto: 50, metodo: MetodoPago.EFECTIVO, fecha: new Date(), venta: null },
    ];

    jest.spyOn(pagoRepository, 'find').mockResolvedValue(pagosMock);

    const resultado = await service.obtenerPorVenta(5);

    expect(resultado).toHaveLength(2);
    expect(resultado[0].ventaId).toBe(5);
  });
});