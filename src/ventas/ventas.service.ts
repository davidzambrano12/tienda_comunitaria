import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
  ) {}

  async crear(createVentaDto: CreateVentaDto, usuarioId: number): Promise<Venta> {

    // 1. Crear la cabecera de la venta
    const venta = this.ventaRepository.create({
      fecha: createVentaDto.fecha || new Date(),
      total: createVentaDto.total,
      cliente: createVentaDto.cliente,
      cajero: { id: usuarioId }
    });

    const guardada = await this.ventaRepository.save(venta);

    // 2. Procesar detalles y actualizar stock
    if (createVentaDto.detalles && createVentaDto.detalles.length > 0) {
      for (const item of createVentaDto.detalles) {
        const producto = await this.productoRepository.findOne({ where: { id: item.id_producto } });
        
        if (!producto) {
          throw new BadRequestException(`Producto con ID ${item.id_producto} no encontrado`);
        }

        if (producto.cantidad < item.cantidad) {
          throw new BadRequestException(`Stock insuficiente para el producto ${producto.nombre}. Disponible: ${producto.cantidad}`);
        }

        // Descontar stock
        producto.cantidad -= item.cantidad;
        await this.productoRepository.save(producto);

        // Crear detalle
        const detalle = this.detalleRepository.create({
          venta: guardada,
          producto: producto,
          cantidad: item.cantidad,
          subtotal: item.subtotal
        });
        await this.detalleRepository.save(detalle);
      }
    }

    await this.auditoriaService.registrar(usuarioId, 'CREAR_VENTA', 'VENTAS', { ventaId: guardada.id });
    await this.notificacionesService.crear(`Nueva venta registrada por ${guardada.total} (ID: ${guardada.id})`, 'EVENTO', usuarioId);

    return this.obtenerPorId(guardada.id);
  }

  async listar(): Promise<Venta[]> {
    return this.ventaRepository.find({
      relations: ['cajero', 'detalles', 'detalles.producto', 'pagos']
    });
  }

  async obtenerPorId(id: number): Promise<Venta | null> {
    return this.ventaRepository.findOne({
      where: { id },
      relations: ['cajero', 'detalles', 'detalles.producto', 'pagos']
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
        : undefined
    });

    return this.obtenerPorId(id);
  }

  async eliminar(id: number): Promise<void> {
    await this.ventaRepository.delete(id);
  }

}