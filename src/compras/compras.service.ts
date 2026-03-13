import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Compra } from './entities/compra.entity';
import { DetalleCompra } from './entities/detalle-compra.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Proveedor } from '../proveedores/entities/proveedor.entity';

import { CreateCompraDto } from './dto/create-compra.dto';

@Injectable()
export class ComprasService {

  constructor(
    @InjectRepository(Compra)
    private compraRepository: Repository<Compra>,

    @InjectRepository(DetalleCompra)
    private detalleRepository: Repository<DetalleCompra>,

    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,

    @InjectRepository(Proveedor)
    private proveedorRepository: Repository<Proveedor>,
  ) {}

  async create(createCompraDto: CreateCompraDto) {

    const proveedor = await this.proveedorRepository.findOne({
      where: { id: createCompraDto.id_proveedor }
    });

    if (!proveedor) {
      throw new Error('Proveedor no encontrado');
    }

    const compra = this.compraRepository.create({
      proveedor,
      total: createCompraDto.total
    });

    await this.compraRepository.save(compra);

    for (const item of createCompraDto.detalles) {

      const producto = await this.productoRepository.findOne({
        where: { id: item.id_producto }
      });

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      const detalle = this.detalleRepository.create({
        compra,
        producto,
        cantidad: item.cantidad,
        subtotal: item.subtotal
      });

      await this.detalleRepository.save(detalle);

    }

    return compra;

  }

}
