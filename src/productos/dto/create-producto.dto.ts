import { IsString, IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  precio: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  cantidad: number; // 👈 cambiado de stock a cantidad

  @IsString()
  @IsOptional()
  categoria?: string;
}