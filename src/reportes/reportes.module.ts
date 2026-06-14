import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Venta } from '../ventas/entities/venta.entity';
import { DetalleVenta } from '../database/entities/detalle_venta.entity';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta, DetalleVenta]),
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 3,
    }),
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
