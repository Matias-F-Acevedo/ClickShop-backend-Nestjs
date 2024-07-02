import { CartItems } from "./cart-items.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("cart")
export class Cart {

    @PrimaryGeneratedColumn()
    cart_id: number;

    @Column()
    user_id: number;

    // ejemplo de numero max: 99999999.99
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) 
    total: number;

    @Column({ type: 'int', default: 0 })
    quantityTotal: number;

    @OneToOne(() => User, user => user.cart, {
        onDelete: "CASCADE"
    }) 
    @JoinColumn({ name: 'user_id' }) 
    user: User;

    @OneToMany(() => CartItems, cartItems => cartItems.cart, {cascade: ["remove"] })
    cartItems: CartItems[];
}
