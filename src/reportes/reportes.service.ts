// src/reportes/reportes.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

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
  // URL del microservicio (configurable por variable de entorno)
  private readonly MS_REPORTES_URL =
    process.env.MS_REPORTES_URL || 'http://localhost:8000';

  constructor(private readonly httpService: HttpService) {}

  async generarReporteVentas(dto: GenerarReporteDto): Promise<Buffer> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.MS_REPORTES_URL}/reportes/ventas`, dto, {
          responseType: 'arraybuffer', // necesario para recibir el PDF binario
          timeout: 15000,              // 15 s de timeout
        }),
      );

      return Buffer.from(response.data);
    } catch (error) {
      // ── Manejo de errores si el microservicio no responde ──────────────
      const axiosError = error as AxiosError;

      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ETIMEDOUT') {
        throw new HttpException(
          'El servicio de reportes no está disponible en este momento. Intente más tarde.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      if (axiosError.response?.status === 500) {
        throw new HttpException(
          'Error interno al generar el reporte PDF.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        'Error al comunicarse con el microservicio de reportes.',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async verificarSaludMicroservicio(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.get(`${this.MS_REPORTES_URL}/health`, { timeout: 5000 }),
      );
      return true;
    } catch {
      return false;
    }
  }
}