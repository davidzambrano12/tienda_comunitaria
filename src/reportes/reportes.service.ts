import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from '../ventas/entities/venta.entity';
import { DetalleVenta } from '../database/entities/detalle_venta.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(DetalleVenta)
    private readonly detalleVentaRepository: Repository<DetalleVenta>,
  ) {}

  async ventasDiarias() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return await this.ventaRepository
      .createQueryBuilder('venta')
      .select('SUM(venta.total)', 'totalIngresos')
      .addSelect('COUNT(venta.id)', 'cantidadVentas')
      .where('venta.fecha >= :hoy', { hoy })
      .getRawOne();
  }

  async ventasPorFecha(inicio: string, fin: string) {
    return await this.ventaRepository
      .createQueryBuilder('venta')
      .select('DATE(venta.fecha)', 'fecha')
      .addSelect('SUM(venta.total)', 'total')
      .where('venta.fecha BETWEEN :inicio AND :fin', { inicio, fin })
      .groupBy('DATE(venta.fecha)')
      .getRawMany();
  }

  async productosMasVendidos() {
    return await this.detalleVentaRepository
      .createQueryBuilder('detalle')
      .leftJoin('detalle.producto', 'producto')
      .select('producto.nombre', 'producto')
      .addSelect('SUM(detalle.cantidad)', 'cantidadTotal')
      .groupBy('producto.id')
      .orderBy('cantidadTotal', 'DESC')
      .limit(10)
      .getRawMany();
  }

  async ingresosTotales() {
    return await this.ventaRepository
      .createQueryBuilder('venta')
      .select('SUM(venta.total)', 'totalAcumulado')
      .getRawOne();
  }
}
