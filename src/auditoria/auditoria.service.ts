import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditoria } from './entities/auditoria.entity';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepository: Repository<Auditoria>,
  ) {}

  async registrar(usuarioId: number, accion: string, modulo: string, detalles?: any) {
    const log = this.auditoriaRepository.create({
      usuarioId,
      accion,
      modulo,
      detalles: detalles ? JSON.stringify(detalles) : null,
    });
    return await this.auditoriaRepository.save(log);
  }

  async listar(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.auditoriaRepository.findAndCount({
      relations: ['usuario'],
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
}
