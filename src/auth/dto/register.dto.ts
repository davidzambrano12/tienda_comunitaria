import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Admin Inicial' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'admin@tienda.com' })
  @IsEmail()
  correo: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  contraseña: string;

  @ApiProperty({
    example: 1,
    description: 'ID del Rol (1 para ADMIN, 2 para CAJERO, etc.)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  id_rol?: number;

  @ApiProperty({
    example: 1,
    description: 'ID del Estado (1 para ACTIVO)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  id_estado?: number;
}
