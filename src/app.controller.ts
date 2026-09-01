import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Verificar estado del servidor y conectividad' })
  @ApiResponse({ status: 200, description: 'Servidor operativo y listo.' })
  checkHealth() {
    return {
      status: 'ok',
      mensaje: '¡Conexión exitosa entre NestJS y React!',
      fecha: new Date().toISOString(),
    };
  }
}

