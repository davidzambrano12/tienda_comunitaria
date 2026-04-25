import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from '../ventas/entities/venta.entity';
import { DetalleVenta } from '../database/entities/detalle_venta.entity';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Venta, DetalleVenta])],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
