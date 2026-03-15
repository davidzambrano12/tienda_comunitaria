import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('ventas')
export class Venta {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_cajero' })
  cajero: Usuario;
    detalles: any;

}