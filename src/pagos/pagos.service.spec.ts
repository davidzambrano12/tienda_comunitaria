import { Test, TestingModule } from '@nestjs/testing';
import { PagosService } from './pagos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pago, MetodoPago } from './entities/pago.entity';
import { Venta } from '../ventas/entities/venta.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PagosService', () => {
  let service: PagosService;
  let pagoRepository: Repository<Pago>;
  let ventaRepository: Repository<Venta>;
  let auditoriaService: AuditoriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagosService,
        {
          provide: getRepositoryToken(Pago),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Venta),
          useValue: {
            findOne: jest.fn(),
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
    ventaRepository = module.get<Repository<Venta>>(getRepositoryToken(Venta));
    auditoriaService = module.get<AuditoriaService>(AuditoriaService);
  });

  it('testDeberiaCrearPagoYRegistrarAuditoria', async () => {
    const ventaMock = { id: 5, total: 200, pagos: [] };
    const pagoMock: Pago = {
      id: 1,
      ventaId: 5,
      monto: 100,
      metodo: MetodoPago.EFECTIVO,
      fecha: new Date(),
      venta: null,
    };

    jest.spyOn(ventaRepository, 'findOne').mockResolvedValue(ventaMock as any);
    jest.spyOn(pagoRepository, 'create').mockReturnValue(pagoMock);
    jest.spyOn(pagoRepository, 'save').mockResolvedValue(pagoMock);

    const resultado = await service.crear(
      { ventaId: 5, monto: 100, metodo: MetodoPago.EFECTIVO },
      1, // usuarioId
    );

    expect(resultado).toEqual(pagoMock);
    expect(auditoriaService.registrar).toHaveBeenCalledWith(
      1,
      'REGISTRO_PAGO',
      'PAGOS',
      { pagoId: 1, ventaId: 5 },
    );
  });

  it('debería lanzar NotFoundException si la venta no existe', async () => {
    jest.spyOn(ventaRepository, 'findOne').mockResolvedValue(null);

    await expect(
      service.crear({ ventaId: 999, monto: 10, metodo: MetodoPago.EFECTIVO }, 1)
    ).rejects.toThrow(NotFoundException);
  });

  it('debería lanzar BadRequestException si el monto excede el saldo', async () => {
    const ventaMock = { id: 5, total: 100, pagos: [{ monto: 80 }] };
    
    jest.spyOn(ventaRepository, 'findOne').mockResolvedValue(ventaMock as any);

    await expect(
      service.crear({ ventaId: 5, monto: 30, metodo: MetodoPago.EFECTIVO }, 1)
    ).rejects.toThrow(BadRequestException);
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
