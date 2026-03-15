import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Categoria } from '../../database/entities/categoria.entity';

@Entity('productos')
export class Producto {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column('int')
  cantidad: number;

  @ManyToOne(() => Categoria, categoria => categoria.productos)
  @JoinColumn({ name: 'id_categoria' })
  categoria: Categoria;

}