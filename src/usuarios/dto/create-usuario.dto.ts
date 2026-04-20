import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsNumber,
  IsPositive
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'juan@tienda.com' })
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  contraseña: string;

  @ApiProperty({ example: 1, description: 'ID del Rol (1: ADMIN, 2: CAJERO)' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  id_rol: number;

  @ApiProperty({ example: 1, description: 'ID del Estado (1: Activo, 2: Inactivo)' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  id_estado: number;

}