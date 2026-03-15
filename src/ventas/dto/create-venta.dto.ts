import { IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVentaDto {

  @IsDateString()
  fecha: Date;

  @Type(() => Number)
  @IsNumber()
  total: number;

  @Type(() => Number)
  @IsNumber()
  id_cajero: number;

}