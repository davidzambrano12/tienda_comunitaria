import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { Estado } from './entities/estado.entity';
import { Rol } from './entities/rol.entity';

@Injectable()
export class DatabaseSeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    @InjectRepository(Estado)
    private readonly estadoRepository: Repository<Estado>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.ensureRoles();
    await this.ensureEstados();
    await this.ensureCategorias();
  }

  private async ensureRoles(): Promise<void> {
    const nombres = ['ADMIN', 'CAJERO', 'SUPERVISOR', 'CONTADOR'];

    for (const nombre of nombres) {
      const existe = await this.rolRepository.findOneBy({ nombre });
      if (!existe) {
        await this.rolRepository.save({ nombre });
      }
    }
  }

  private async ensureEstados(): Promise<void> {
    const nombres = ['ACTIVO', 'INACTIVO'];

    for (const nombre of nombres) {
      const existe = await this.estadoRepository.findOneBy({ nombre });
      if (!existe) {
        await this.estadoRepository.save({ nombre });
      }
    }
  }

  private async ensureCategorias(): Promise<void> {
    const nombres = ['Granos', 'Pasta', 'Salsas'];

    for (const nombre of nombres) {
      const existe = await this.categoriaRepository.findOneBy({ nombre });
      if (!existe) {
        await this.categoriaRepository.save({ nombre });
      }
    }
  }
}
