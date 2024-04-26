import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Products } from 'src/products/entities/product.entity';

@Entity("cart")
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number; // Esta columna debería almacenar el ID del usuario que posee el carrito

  @OneToOne(() => User, user => user.cart)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToMany(() => Products)
  @JoinTable({
    name: 'cart_products',
    joinColumn: {
      name: 'cartId',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'productId',
      referencedColumnName: 'productId'
    }
  })
  products: Products[];

  @Column({ default: 0 })
  totalPrice: number; 

  
} 
