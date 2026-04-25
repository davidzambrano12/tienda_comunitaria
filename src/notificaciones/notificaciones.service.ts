import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from './entities/notificacion.entity';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepository: Repository<Notificacion>,
  ) {}

  async crear(mensaje: string, tipo: string, usuarioId?: number) {
    const notificacion = this.notificacionRepository.create({
      mensaje,
      tipo,
      usuarioId,
    });
    console.log(`[NOTIFICACIÓN] ${tipo}: ${mensaje}`); // Simulate email/log output
    return await this.notificacionRepository.save(notificacion);
  }

  async listar() {
    return await this.notificacionRepository.find({
      relations: ['usuario'],
      order: { fecha: 'DESC' },
    });
  }
}
