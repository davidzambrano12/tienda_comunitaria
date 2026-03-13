import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('proveedores')
export class Proveedor {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  contacto: string;

  @Column({ nullable: true })
  direccion: string;

}
