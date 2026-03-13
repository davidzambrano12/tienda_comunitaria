import { IsString, IsOptional } from 'class-validator';

export class CreateProveedorDto {

  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  contacto?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

}
