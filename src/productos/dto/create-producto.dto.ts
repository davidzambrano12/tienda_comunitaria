import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
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
  cantidad: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  id_categoria: number;

}