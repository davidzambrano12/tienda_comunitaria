import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ComprasController } from './compras.controller';
import { ComprasService } from './compras.service';

import { Compra } from './entities/compra.entity';
import { DetalleCompra } from './entities/detalle-compra.entity';

import { Proveedor } from '../proveedores/entities/proveedor.entity';
import { Producto } from 'src/productos/entities/producto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Compra,
      DetalleCompra,
      Producto,
      Proveedor
    ])
  ],
  controllers: [ComprasController],
  providers: [ComprasService],
})
export class ComprasModule {}
