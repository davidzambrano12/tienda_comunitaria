import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Categoria } from './entities/categoria.entity';
import { Estado } from './entities/estado.entity';
import { Rol } from './entities/rol.entity';
import { DatabaseSeedService } from './database-seed.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Rol, Categoria, Estado]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';
        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST'),
          port: parseInt(configService.get<string>('DB_PORT') || '3306'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true,
          // Se recomienda usar Migraciones para entornos de producción.
          logging: !isProduction,
        };
      },
    }),
  ],
  providers: [DatabaseSeedService],
})
export class DatabaseModule {}
