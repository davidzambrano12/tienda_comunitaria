import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  @ApiProperty({
    example: '123456',
    required: false,
    description: 'Nueva contraseña opcional',
  })
  @IsOptional()
  @ValidateIf(
    (o) =>
      o.contraseña !== '' &&
      o.contraseña !== undefined &&
      o.contraseña !== null,
  )
  @IsString()
  contraseña?: string;
}

