import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { MetodoPago } from '../entities/pago.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePagoDto {
  @ApiProperty()
  @IsNumber()
  ventaId: number;

  @ApiProperty({ enum: MetodoPago })
  @IsEnum(MetodoPago)
  metodo: MetodoPago;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  monto: number;
}
