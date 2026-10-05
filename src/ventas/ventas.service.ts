import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Venta } from './entities/venta.entity';
import { DetalleVenta } from '../database/entities/detalle_venta.entity';
import { Producto } from '../productos/entities/producto.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(DetalleVenta)
    private readonly detalleVentaRepository: Repository<DetalleVenta>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    private readonly auditoriaService: AuditoriaService,
    private readonly notificacionesService: NotificacionesService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Registra una venta completa con transacción:
   * 1. Valida el stock de cada producto.
   * 2. Descuenta el stock en la tabla productos.
   * 3. Inserta la venta y sus detalles.
   */
  async crear(
    createVentaDto: CreateVentaDto,
    usuarioId: number,
  ): Promise<Venta> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!createVentaDto.detalles || createVentaDto.detalles.length === 0) {
        throw new BadRequestException(
          'La venta debe incluir al menos un producto.',
        );
      }

      // 1. Crear la cabecera de la venta
      const venta = queryRunner.manager.create(Venta, {
        total: Number(createVentaDto.total),
        cliente: createVentaDto.cliente || 'Consumidor Final',
        cajero: { id: usuarioId } as any,
        fecha: createVentaDto.fecha
          ? new Date(createVentaDto.fecha)
          : new Date(),
      });

      const ventaGuardada = await queryRunner.manager.save(Venta, venta);

      // 2. Procesar cada detalle y descontar stock
      for (const item of createVentaDto.detalles) {
        const producto = await queryRunner.manager.findOne(Producto, {
          where: { id: item.id_producto },
        });

        if (!producto) {
          throw new NotFoundException(
            `Producto con ID ${item.id_producto} no encontrado.`,
          );
        }

        if (producto.cantidad < item.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para "${producto.nombre}". Disponibles: ${producto.cantidad}, solicitados: ${item.cantidad}.`,
          );
        }

        // Descontar stock
        producto.cantidad -= item.cantidad;
        await queryRunner.manager.save(Producto, producto);

        // Crear detalle de venta
        const detalle = queryRunner.manager.create(DetalleVenta, {
          venta: { id: ventaGuardada.id } as any,
          producto: { id: item.id_producto } as any,
          cantidad: item.cantidad,
          subtotal: Number(
            item.subtotal || item.cantidad * Number(producto.precio),
          ),
        });

        await queryRunner.manager.save(DetalleVenta, detalle);
      }

      // 3. Confirmar la transacción
      await queryRunner.commitTransaction();

      // Auditoría y Notificaciones (opcional)
      try {
        await this.auditoriaService.registrar(
          usuarioId,
          'CREAR_VENTA',
          'ventas',
          { ventaId: ventaGuardada.id, total: ventaGuardada.total },
        );
        await this.notificacionesService.crear(
          `Nueva venta registrada por $${ventaGuardada.total} (ID: ${ventaGuardada.id})`,
          'EVENTO',
          usuarioId,
        );
      } catch (e) {
        // Ignorar fallo secundario en auditoría/notificaciones para no romper la venta
      }

      return await this.obtenerPorId(ventaGuardada.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async listar(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.ventaRepository.findAndCount({
      take: limit,
      skip: skip,
      order: { id: 'DESC' },
      relations: ['cajero', 'detalles', 'detalles.producto'],
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

  async obtenerPorId(id: number): Promise<Venta> {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: ['cajero', 'detalles', 'detalles.producto'],
    });

    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada.`);
    }

    return venta;
  }

  async actualizar(id: number, updateVentaDto: UpdateVentaDto): Promise<Venta> {
    const venta = await this.obtenerPorId(id);
    Object.assign(venta, updateVentaDto);
    return await this.ventaRepository.save(venta);
  }

  async eliminar(id: number): Promise<void> {
    const venta = await this.obtenerPorId(id);
    await this.ventaRepository.remove(venta);
  }
}
