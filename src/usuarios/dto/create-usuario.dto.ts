import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RolUsuario } from '../entities/usuario.entity'; // 👈 IMPORTANTE

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

  @IsEnum(RolUsuario)
  rol: RolUsuario;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}