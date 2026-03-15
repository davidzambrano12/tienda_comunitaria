import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsNumber,
  IsPositive
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUsuarioDto {

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  contraseña: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  id_rol: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  id_estado: number;

}