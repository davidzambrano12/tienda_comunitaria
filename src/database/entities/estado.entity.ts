import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('estados')
export class Estado {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  nombre: string;
  @OneToMany(() => Usuario, usuario => usuario.estado)
  usuarios: Usuario[];  
}