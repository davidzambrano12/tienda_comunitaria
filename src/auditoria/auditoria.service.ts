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

  async listar() {
    return await this.auditoriaRepository.find({
      relations: ['usuario'],
      order: { fecha: 'DESC' },
    });
  }
}
