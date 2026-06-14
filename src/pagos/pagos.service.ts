import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './entities/pago.entity';
import { Venta } from '../ventas/entities/venta.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async crear(createPagoDto: CreatePagoDto, usuarioId: number) {
    // 1. Validar que la venta exista
    const venta = await this.ventaRepository.findOne({
      where: { id: createPagoDto.ventaId },
      relations: ['pagos']
    });

    if (!venta) {
      throw new NotFoundException(`La venta con ID ${createPagoDto.ventaId} no existe`);
    }

    // 2. Validar que el pago no exceda el total de la venta
    const totalPagado = venta.pagos.reduce((sum, p) => sum + Number(p.monto), 0);
    const saldoPendiente = Number(venta.total) - totalPagado;

    if (createPagoDto.monto > saldoPendiente + 0.01) { // Pequeño margen por decimales
      throw new BadRequestException(`El monto del pago ($${createPagoDto.monto}) excede el saldo pendiente ($${saldoPendiente.toFixed(2)})`);
    }

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
