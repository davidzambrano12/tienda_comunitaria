import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auditoria')
@ApiBearerAuth()
@Controller('auditoria')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiResponse({ status: 401, description: 'No autenticado. Se requiere un token JWT válido.' })
@ApiResponse({ status: 403, description: 'No autorizado. Se requiere el rol ADMIN.' })
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener logs de auditoría (Solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista de auditoría recuperada con éxito.' })
  listar() {
    return this.auditoriaService.listar();
  }
}
