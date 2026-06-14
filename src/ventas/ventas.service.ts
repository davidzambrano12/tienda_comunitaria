import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Venta } from './entities/venta.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { DetalleVenta } from '../database/entities/detalle_venta.entity';
import { Producto } from '../productos/entities/producto.entity';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(DetalleVenta)
    private readonly detalleRepository: Repository<DetalleVenta>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    private readonly auditoriaService: AuditoriaService,
    private readonly notificacionesService: NotificacionesService,
    private readonly dataSource: DataSource,
  ) {}

  async crear(
    createVentaDto: CreateVentaDto,
    usuarioId: number,
  ): Promise<Venta> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Crear la cabecera de la venta
      const venta = queryRunner.manager.create(Venta, {
        fecha: createVentaDto.fecha || new Date(),
        total: createVentaDto.total,
        cliente: createVentaDto.cliente,
        cajero: { id: usuarioId },
      });

      const guardada = await queryRunner.manager.save(venta);

      // 2. Procesar detalles y actualizar stock
      if (createVentaDto.detalles && createVentaDto.detalles.length > 0) {
        for (const item of createVentaDto.detalles) {
          const producto = await queryRunner.manager.findOne(Producto, {
            where: { id: item.id_producto },
            lock: { mode: 'pessimistic_write' }, // Bloqueo para evitar colisiones de stock
          });

          if (!producto) {
            throw new BadRequestException(
              `Producto con ID ${item.id_producto} no encontrado`,
            );
          }

          if (producto.cantidad < item.cantidad) {
            throw new BadRequestException(
              `Stock insuficiente para el producto ${producto.nombre}. Disponible: ${producto.cantidad}`,
            );
          }

          // Descontar stock
          producto.cantidad -= item.cantidad;
          await queryRunner.manager.save(producto);

          // Crear detalle
          const detalle = queryRunner.manager.create(DetalleVenta, {
            venta: guardada,
            producto: producto,
            cantidad: item.cantidad,
            subtotal: item.subtotal,
          });
          await queryRunner.manager.save(detalle);
        }
      }

      await queryRunner.commitTransaction();

      // Acciones post-transacción (si fallan, la venta ya está segura)
      try {
        await this.auditoriaService.registrar(
          usuarioId,
          'CREAR_VENTA',
          'VENTAS',
          { ventaId: guardada.id },
        );
        await this.notificacionesService.crear(
          `Nueva venta registrada por ${guardada.total} (ID: ${guardada.id})`,
          'EVENTO',
          usuarioId,
        );
      } catch (error) {
        console.error(
          'Error en servicios secundarios (Auditoria/Notificaciones):',
          error,
        );
      }

      return this.obtenerPorId(guardada.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Error al procesar la venta: ' + error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async listar(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.ventaRepository.findAndCount({
      relations: ['cajero', 'detalles', 'detalles.producto', 'pagos'],
      order: { fecha: 'DESC' },
      take: limit,
      skip: skip,
    });

    return {
      data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async obtenerPorId(id: number): Promise<Venta | null> {
    return this.ventaRepository.findOne({
      where: { id },
      relations: ['cajero', 'detalles', 'detalles.producto', 'pagos'],
    });
  }

  async actualizar(
    id: number,
    updateVentaDto: UpdateVentaDto,
  ): Promise<Venta | null> {
    await this.ventaRepository.update(id, {
      fecha: updateVentaDto.fecha,
      total: updateVentaDto.total,
      cajero: updateVentaDto.id_cajero
        ? { id: updateVentaDto.id_cajero }
        : undefined,
    });

    return this.obtenerPorId(id);
  }

  async eliminar(id: number): Promise<void> {
    await this.ventaRepository.delete(id);
  }
}
