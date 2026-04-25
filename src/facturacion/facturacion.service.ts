import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from '../ventas/entities/venta.entity';

@Injectable()
export class FacturacionService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
  ) {}

  async generarFactura(ventaId: number) {
    const venta = await this.ventaRepository.findOne({
      where: { id: ventaId },
      relations: ['cajero', 'detalles', 'detalles.producto', 'pagos'],
    });

    if (!venta) {
      throw new NotFoundException(`Venta con ID ${ventaId} no encontrada`);
    }

    // Formatear datos para la factura
    return {
      encabezado: {
        nro_factura: `FAC-${venta.id.toString().padStart(6, '0')}`,
        fecha: venta.fecha,
        cajero: venta.cajero.nombre,
        cliente: venta.cliente || 'Consumidor Final',
      },
      items: venta.detalles.map(d => ({
        producto: d.producto.nombre,
        cantidad: d.cantidad,
        precio_unitario: d.producto.precio,
        subtotal: d.subtotal,
      })),
      totales: {
        total: venta.total,
      },
      pagos: venta.pagos.map(p => ({
        metodo: p.metodo,
        monto: p.monto,
        fecha: p.fecha,
      }))
    };
  }
}
