import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { OneToMany } from 'typeorm';
import { DetalleVenta } from '../../database/entities/detalle_venta.entity';

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

  @OneToMany(() => DetalleVenta, (detalle) => detalle.venta)
  detalles: DetalleVenta[];

}