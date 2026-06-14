import { Test, TestingModule } from '@nestjs/testing';
import { VentasService } from './ventas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { DetalleVenta } from '../database/entities/detalle_venta.entity';
import { Producto } from '../productos/entities/producto.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { DataSource } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

describe('VentasService', () => {
  let service: VentasService;
  let dataSource: DataSource;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VentasService,
        {
          provide: getRepositoryToken(Venta),
          useValue: { findAndCount: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(DetalleVenta),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Producto),
          useValue: {},
        },
        {
          provide: AuditoriaService,
          useValue: { registrar: jest.fn() },
        },
        {
          provide: NotificacionesService,
          useValue: { crear: jest.fn() },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<VentasService>(VentasService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('crear', () => {
    it('debería lanzar BadRequestException si el producto no tiene stock suficiente', async () => {
      const createDto = {
        total: 100,
        detalles: [{ id_producto: 1, cantidad: 10, subtotal: 100 }],
      };
      const usuarioId = 1;

      // Mock de producto con stock insuficiente (5)
      mockQueryRunner.manager.findOne.mockResolvedValue({
        id: 1,
        nombre: 'Arroz',
        cantidad: 5,
      });

      await expect(service.crear(createDto, usuarioId)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('debería completar la venta y hacer commit si todo es correcto', async () => {
      const createDto = {
        total: 50,
        detalles: [{ id_producto: 1, cantidad: 2, subtotal: 50 }],
      };
      
      mockQueryRunner.manager.create.mockReturnValue({ id: 100 });
      mockQueryRunner.manager.save.mockResolvedValue({ id: 100 });
      mockQueryRunner.manager.findOne.mockResolvedValue({
        id: 1,
        nombre: 'Pasta',
        cantidad: 20,
      });

      // Mock de obtenerPorId al final del servicio
      jest.spyOn(service, 'obtenerPorId').mockResolvedValue({ id: 100 } as any);

      const resultado = await service.crear(createDto, 1);

      expect(resultado).toBeDefined();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
    });
  });
});
