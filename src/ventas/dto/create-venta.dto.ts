import { IsNumber, IsDateString, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DetalleVentaDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id_producto: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  cantidad: number;

  @ApiProperty({ example: 50.00 })
  @IsNumber()
  subtotal: number;
}

export class CreateVentaDto {
  @ApiProperty({ example: '2026-04-25T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  fecha?: Date;

  @ApiProperty({ example: 100.00 })
  @IsNumber()
  total: number;

  @ApiProperty({ example: 'Juan Pérez', required: false })
  @IsOptional()
  @IsString()
  cliente?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  id_cajero?: number;

  @ApiProperty({ type: [DetalleVentaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleVentaDto)
  detalles: DetalleVentaDto[];
}
