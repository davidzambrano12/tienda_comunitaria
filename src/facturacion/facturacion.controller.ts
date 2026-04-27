import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FacturacionService } from './facturacion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('facturacion')
@ApiBearerAuth('access-token')
@Controller('facturacion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}

  @Get(':ventaId')
  @Roles(Role.ADMIN, Role.CONTADOR, Role.CAJERO)
  generarFactura(@Param('ventaId') ventaId: number) {
    return this.facturacionService.generarFactura(ventaId);
  }
}
