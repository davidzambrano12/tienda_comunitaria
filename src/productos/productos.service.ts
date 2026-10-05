import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { Categoria } from '../database/entities/categoria.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) { }

  async crear(createProductoDto: CreateProductoDto): Promise<Producto> {
    const dto: any = createProductoDto;
    const idCat = dto.id_categoria ?? dto.categoria_id ?? dto.categoriaId ?? (typeof dto.categoria === 'object' ? dto.categoria?.id : dto.categoria);

    const producto = this.productoRepository.create({
      ...createProductoDto,
      categoria: idCat ? ({ id: Number(idCat) } as any) : undefined,
    });
    return await this.productoRepository.save(producto);
  }

  async listar(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.productoRepository.findAndCount({
      take: limit,
      skip: skip,
      order: { nombre: 'ASC' },
      relations: ['categoria'], // 👈 Trae siempre la categoría real desde MySQL
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

  async obtenerPorId(id: number): Promise<Producto | null> {
    const producto = await this.productoRepository.findOne({
      where: { id },
      relations: ['categoria'], // 👈 Trae la categoría por ID
    });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return producto;
  }

  async actualizar(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<Producto | null> {
    const dto: any = updateProductoDto;
    const idCat = dto.id_categoria ?? dto.categoria_id ?? dto.categoriaId ?? (typeof dto.categoria === 'object' ? dto.categoria?.id : dto.categoria);

    const producto = await this.productoRepository.preload({
      id,
      ...updateProductoDto,
      categoria: idCat !== undefined ? ({ id: Number(idCat) } as any) : undefined,
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    await this.productoRepository.save(producto);
    return this.obtenerPorId(id);
  }

  async eliminar(id: number): Promise<void> {
    const producto = await this.obtenerPorId(id);
    await this.productoRepository.remove(producto);
  }

  async crearCategoria(dto: { nombre: string }): Promise<Categoria> {
    if (!dto?.nombre || !dto.nombre.trim()) {
      throw new BadRequestException('El nombre de la categoría es obligatorio');
    }
    const nombreLimpio = dto.nombre.trim();
    const existente = await this.categoriaRepository.findOne({
      where: { nombre: nombreLimpio },
    });
    if (existente) {
      throw new ConflictException(
        `La categoría "${nombreLimpio}" ya existe.`,
      );
    }
    const nuevaCategoria = this.categoriaRepository.create({
      nombre: nombreLimpio,
    });
    return await this.categoriaRepository.save(nuevaCategoria);
  }

  async listarCategorias(): Promise<Categoria[]> {
    return await this.categoriaRepository.find({
      order: { nombre: 'ASC' },
    });
  }
}

