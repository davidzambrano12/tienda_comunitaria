import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('roles')
export class Rol {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  nombre: string;

}