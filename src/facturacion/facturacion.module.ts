import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from '../ventas/entities/venta.entity';
import { FacturacionService } from './facturacion.service';
import { FacturacionController } from './facturacion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Venta])],
  controllers: [FacturacionController],
  providers: [FacturacionService],
})
export class FacturacionModule {}
