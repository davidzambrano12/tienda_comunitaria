import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Compra } from '../../compras/entities/compra.entity';
import { Producto } from 'src/productos/entities/producto.entity';
 

@Entity('detalle_compras')
export class DetalleCompra {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cantidad: number;

  @Column()
  subtotal: number;

  @ManyToOne(() => Compra)
  @JoinColumn({ name: 'id_compra' })
  compra: Compra;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'id_producto' })
  producto: Producto;

}
