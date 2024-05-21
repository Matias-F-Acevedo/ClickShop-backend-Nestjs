import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Products } from 'src/products/entities/product.entity'; // Renombré la importación a Product para seguir convenciones

@Entity("cart")
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @OneToOne(() => User, user => user.cart)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Products, products => products.cart)
  @JoinColumn({ name: 'productId' })
  products: Products[]; 

  @Column({ default: 0 })
  totalPrice: number; 
}
