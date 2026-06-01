import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { Venta } from '../ventas/entities/venta.entity';

export interface GenerarReporteDto {
  titulo?: string;
  fecha_inicio: string;
  fecha_fin: string;
  ventas: {
    id: number;
    fecha: string;
    cajero: string;
    total: number;
    detalles: { producto: string; cantidad: number; subtotal: number }[];
  }[];
}

@Injectable()
export class ReportesService {
  private readonly MS_REPORTES_URL = process.env.MS_REPORTES_URL || 'http://localhost:8001';

  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    private readonly httpService: HttpService,
  ) {}

  async generarReporteDiarioPDF(): Promise<Buffer> {
    console.log('--- Iniciando generación de reporte diario ---');

    // DEBUG: Ver qué fecha tiene la última venta guardada en la BD
    // En versiones nuevas de TypeORM, findOne necesita un objeto con 'where' o estar vacío
    const ultima = await this.ventaRepository.findOne({ 
      where: {}, 
      order: { fecha: 'DESC' } 
    });
    
    if (ultima) {
      console.log(`Última venta en BD: ID=${ultima.id}, Fecha=${ultima.fecha}`);
    }

    // Buscamos las ventas donde la fecha sea igual a la fecha actual de la BD
    const ventasDb = await this.ventaRepository.find({
      where: {
        fecha: Raw((alias) => `DATE(${alias}) = CURRENT_DATE`),
      },
      relations: ['cajero', 'detalles', 'detalles.producto'],
      order: { fecha: 'DESC' },
    });

    console.log(`Ventas encontradas para hoy: ${ventasDb.length}`);

    if (ventasDb.length === 0) {
      // Fallback: Si realmente no hay nada hoy, mostrar las últimas 5 para la demo
      const ultimasVentas = await this.ventaRepository.find({
        take: 5,
        relations: ['cajero', 'detalles', 'detalles.producto'],
        order: { fecha: 'DESC' },
      });

      if (ultimasVentas.length === 0) {
        throw new HttpException('No hay ventas registradas en el sistema.', HttpStatus.NOT_FOUND);
      }

      return this.formatearYEnviar(ultimasVentas, 'Reporte de Últimas Ventas');
    }

    return this.formatearYEnviar(ventasDb, 'Reporte de Ventas Diarias');
  }

  private async formatearYEnviar(ventasDb: Venta[], titulo: string): Promise<Buffer> {
    const hoyStr = new Date().toLocaleDateString();
    
    const dto: GenerarReporteDto = {
      titulo: `${titulo} (Tienda Comunitaria)`,
      fecha_inicio: hoyStr,
      fecha_fin: hoyStr,
      ventas: ventasDb.map((v) => ({
        id: Number(v.id),
        fecha: v.fecha instanceof Date ? v.fecha.toISOString().split('T')[0] : String(v.fecha),
        cajero: v.cajero?.nombre || 'Desconocido',
        total: Number(v.total),
        detalles: v.detalles.map((d) => ({
          producto: d.producto?.nombre || 'Producto eliminado',
          cantidad: Number(d.cantidad),
          subtotal: Number(d.subtotal),
        })),
      })),
    };

    console.log('Enviando datos al microservicio:', JSON.stringify(dto, null, 2));
    return this.generarReporteVentas(dto);
  }

  async generarReporteVentas(dto: GenerarReporteDto): Promise<Buffer> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.MS_REPORTES_URL}/reportes/ventas`, dto, {
          responseType: 'arraybuffer',
          timeout: 15000,
        }),
      );

      return Buffer.from(response.data as any);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error en el microservicio:', axiosError.response?.data ? 
        Buffer.from(axiosError.response.data as any).toString() : 
        axiosError.message);

      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ETIMEDOUT') {
        throw new HttpException('El servicio de reportes no está disponible.', HttpStatus.SERVICE_UNAVAILABLE);
      }
      throw new HttpException('Error al generar el reporte PDF en el microservicio.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verificarSaludMicroservicio(): Promise<boolean> {
    try {
      await firstValueFrom(this.httpService.get(`${this.MS_REPORTES_URL}/health`, { timeout: 5000 }));
      return true;
    } catch {
      return false;
    }
  }
}