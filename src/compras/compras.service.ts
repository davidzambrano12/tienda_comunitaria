import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Compra } from './entities/compra.entity';
import { DetalleCompra } from '../database/entities/detalle_compra.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Proveedor } from '../proveedores/entities/proveedor.entity';

import { CreateCompraDto } from './dto/create-compra.dto';

@Injectable()
export class ComprasService {

  constructor(
    @InjectRepository(Compra)
    private readonly compraRepository: Repository<Compra>,
    @InjectRepository(DetalleCompra)
    private readonly detalleRepository: Repository<DetalleCompra>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
    private readonly dataSource: DataSource,
  ) {}

  async crear(createCompraDto: CreateCompraDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const proveedor = await queryRunner.manager.findOne(Proveedor, {
        where: { id: createCompraDto.id_proveedor }
      });

      if (!proveedor) {
        throw new BadRequestException('Proveedor no encontrado');
      }

      const compra = queryRunner.manager.create(Compra, {
        proveedor,
        total: createCompraDto.total
      });

      const compraGuardada = await queryRunner.manager.save(compra);

      for (const item of createCompraDto.detalles) {
        const producto = await queryRunner.manager.findOne(Producto, {
          where: { id: item.id_producto },
          lock: { mode: 'pessimistic_write' }
        });

        if (!producto) {
          throw new BadRequestException(`Producto con ID ${item.id_producto} no encontrado`);
        }

        // Actualizar stock del producto al comprar
        producto.cantidad += item.cantidad;
        await queryRunner.manager.save(producto);

        const detalle = queryRunner.manager.create(DetalleCompra, {
          compra: compraGuardada,
          producto,
          cantidad: item.cantidad,
          subtotal: item.subtotal
        });

        await queryRunner.manager.save(detalle);
      }

      await queryRunner.commitTransaction();
      return this.obtenerPorId(compraGuardada.id);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error al registrar la compra: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async listar(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.compraRepository.findAndCount({
      relations: ['proveedor', 'detalles', 'detalles.producto'],
      order: { fecha: 'DESC' },
      take: limit,
      skip: skip,
    });

    return {
      data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit)
      }
    };
  }

  async obtenerPorId(id: number) {
    return await this.compraRepository.findOne({
      where: { id },
      relations: ['proveedor', 'detalles', 'detalles.producto']
    });
  }


}
