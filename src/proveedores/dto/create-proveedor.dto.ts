import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProveedorDto {

  @ApiProperty({ example: 'Distribuidora S.A.' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: '3001234567', required: false })
  @IsOptional()
  @IsString()
  contacto?: string;

  @ApiProperty({ example: 'Calle 123 #45-67', required: false })
  @IsOptional()
  @IsString()
  direccion?: string;

}
