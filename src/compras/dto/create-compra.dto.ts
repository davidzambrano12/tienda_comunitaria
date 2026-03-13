import { IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DetalleDto {

  @IsNumber()
  id_producto: number;

  @IsNumber()
  cantidad: number;

  @IsNumber()
  subtotal: number;

}

export class CreateCompraDto {

  @IsNumber()
  id_proveedor: number;

  @IsNumber()
  total: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleDto)
  detalles: DetalleDto[];

}
