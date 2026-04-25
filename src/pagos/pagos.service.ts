import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './entities/pago.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async crear(createPagoDto: CreatePagoDto, usuarioId: number) {
    const pago = this.pagoRepository.create(createPagoDto);
    const guardado = await this.pagoRepository.save(pago);

    await this.auditoriaService.registrar(
      usuarioId,
      'REGISTRO_PAGO',
      'PAGOS',
      { pagoId: guardado.id, ventaId: guardado.ventaId }
    );

    return guardado;
  }

  async obtenerPorVenta(ventaId: number) {
    return await this.pagoRepository.find({
      where: { ventaId },
      order: { fecha: 'DESC' },
    });
  }
}
