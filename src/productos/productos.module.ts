import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { Categoria } from '../database/entities/categoria.entity';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, Categoria])
  ],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule {}