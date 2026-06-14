import { IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class DetalleDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id_producto: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  cantidad: number;

  @ApiProperty({ example: 350000.0 })
  @IsNumber()
  subtotal: number;
}

export class CreateCompraDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id_proveedor: number;

  @ApiProperty({ example: 350000.0 })
  @IsNumber()
  total: number;

  @ApiProperty({ type: [DetalleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleDto)
  detalles: DetalleDto[];
}
