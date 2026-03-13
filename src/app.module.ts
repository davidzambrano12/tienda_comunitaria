import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ProductosModule } from './productos/productos.module';

import { ProveedoresModule } from './proveedores/proveedores.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ComprasModule } from './compras/compras.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ProductosModule, UsuariosModule, ProductosModule, ProveedoresModule, AuthModule, DatabaseModule, ComprasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
