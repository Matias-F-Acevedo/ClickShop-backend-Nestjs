import { Cart } from 'src/cart/entities/cart.entity';
import { Products } from 'src/products/entities/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn} from 'typeorm';

@Entity("cart_items")
export class CartItems {

    @PrimaryGeneratedColumn()
    cartItem_id: number;

    @Column()
    cart_id: number;

    @Column()
    product_id: number;

    @Column()
    quantity: number;

    @Column({type: 'decimal', precision: 10, scale: 2})
    unitPrice: number;
    
    @Column({type: 'decimal', precision: 10, scale: 2})
    subtotal: number;

    @ManyToOne(() => Cart, cart => cart.cartItems,{onDelete: "CASCADE"})
    @JoinColumn({ name:'cart_id'}) 
    cart: Cart;


    @ManyToOne(() => Products, product => product.cartItems)
    @JoinColumn({ name: 'product_id' })
    product: Products;

}
