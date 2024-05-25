import { Cart } from "src/cart/entities/cart.entity";
import { Order } from "src/order/entities/order.entity";
import { Products } from "src/products/entities/product.entity";
import { Review } from "src/review/entities/review.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

// nombre de la tabla: 
@Entity("users")
export class User {

    @PrimaryGeneratedColumn()
    user_id: number;

    @Column()
    user_name: string;

    @Column()
    user_lastname: string;

    @Column()
    user_phoneNumber: string;

    @Column()
    user_address: string;

    @Column()
    user_identificationNumber: string;

    @Column({ unique: true })
    user_email: string;

    @Column()
    user_password: string;

    @Column({ length: 150, default:"default-image-user/default-image-user.jpg"})
    user_image: string;

    @Column({ nullable: true })
    cart_id: number;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    user_createdAt: Date;

    @Column({ type: "uuid", unique: true, name: "reset_password_token", nullable: true })
    reset_password_token: string;

    @OneToMany(() => Products, product => product.user)
    product: Products[];

    @OneToMany(() => Order, order => order.user, { cascade: ["remove"] })
    orders: Order[];

    @OneToOne(() => Cart, { cascade: ["remove"] })
    @JoinColumn({name:"cart_id"})
    cart: Cart;

    @OneToMany(() => Review, review => review.review, { cascade: ["remove"] })
    review: Review[];
}
