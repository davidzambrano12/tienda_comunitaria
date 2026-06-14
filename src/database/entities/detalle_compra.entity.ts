import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Compra } from '../../compras/entities/compra.entity';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('detalle_compras')
export class DetalleCompra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @ManyToOne(() => Compra, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_compra' })
  compra: Compra;

  @ManyToOne(() => Producto, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_producto' })
  producto: Producto;
}
