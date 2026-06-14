import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductoDto {
  @ApiProperty({ example: 'Arroz Diana 1kg' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 4500.0 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  precio: number;

  @ApiProperty({ example: 50 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  cantidad: number;

  @ApiProperty({ example: 1, description: 'ID de la categoría' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  id_categoria: number;
}
