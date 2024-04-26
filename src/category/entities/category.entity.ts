import { Products } from "src/products/entities/product.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity({ name: 'category' }) // Nombre de la tabla en la base de datos
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => Products, (product) => product.category)
    product: Products[]

}
