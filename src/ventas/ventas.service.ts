import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Venta } from './entities/venta.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';

@Injectable()
export class VentasService {

  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
  ) {}

  async crear(createVentaDto: CreateVentaDto): Promise<Venta> {

    const venta = this.ventaRepository.create({
      fecha: createVentaDto.fecha,
      total: createVentaDto.total,
      cajero: { id: createVentaDto.id_cajero }
    });

    return this.ventaRepository.save(venta);
  }

  async listar(): Promise<Venta[]> {
    return this.ventaRepository.find({
      relations: ['cajero']
    });
  }

  async obtenerPorId(id: number): Promise<Venta | null> {
    return this.ventaRepository.findOne({
      where: { id },
      relations: ['cajero']
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