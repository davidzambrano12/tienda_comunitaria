import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) {}

  async crear(createProductoDto: CreateProductoDto): Promise<Producto> {
    const producto = this.productoRepository.create(createProductoDto);
    return this.productoRepository.save(producto);
  }

  async listar(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.productoRepository.findAndCount({
      take: limit,
      skip: skip,
      order: { nombre: 'ASC' }
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

  async obtenerPorId(id: number): Promise<Producto | null> {
    return this.productoRepository.findOneBy({ id });
  }

  async actualizar(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<Producto | null> {
    await this.productoRepository.update(id, updateProductoDto);
    return this.obtenerPorId(id);
  }

  async eliminar(id: number): Promise<void> {
    await this.productoRepository.delete(id);
  }
}