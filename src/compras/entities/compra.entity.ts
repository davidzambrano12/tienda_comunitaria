import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Proveedor } from '../../proveedores/entities/proveedor.entity';

@Entity('compras')
export class Compra {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column()
  total: number;

  @ManyToOne(() => Proveedor)
  @JoinColumn({ name: 'id_proveedor' })
  proveedor: Proveedor;

}
