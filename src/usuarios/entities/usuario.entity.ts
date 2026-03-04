import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum RolUsuario {
  ADMIN = 'ADMIN',
  CAJERO = 'CAJERO',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100, unique: true })
  correo: string;

  @Column({ length: 255 })
  contraseña: string;

  @Column({
    type: 'enum',
    enum: RolUsuario,
  })
  rol: RolUsuario;

  @Column({ default: true })
  estado: boolean;
}