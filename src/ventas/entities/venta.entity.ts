import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { DetalleVenta } from '../../database/entities/detalle_venta.entity';
import { Pago } from '../../pagos/entities/pago.entity';

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ length: 100, nullable: true })
  cliente: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_cajero' })
  cajero: Usuario;

  @OneToMany(() => DetalleVenta, (detalle) => detalle.venta)
  detalles: DetalleVenta[];

  @OneToMany(() => Pago, (pago) => pago.venta)
  pagos: Pago[];
}
