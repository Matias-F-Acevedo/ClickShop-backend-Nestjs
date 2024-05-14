
import { Cart } from "src/cart/entities/cart.entity";
import { Category } from "src/category/entities/category.entity";
import { Review } from "src/review/entities/review.entity";
import { User } from "src/users/entities/user.entity";
import {Column, Entity, JoinColumn, ManyToMany, ManyToOne,OneToMany, PrimaryGeneratedColumn } from "typeorm";


export enum ProductCondition {
    NEW = 'NEW',
    USED= 'USED',
}

@Entity("Products")
export class Products {

    @PrimaryGeneratedColumn()
    productId: number;

    @Column()
    category_id: number;

    @Column({nullable: true})
    user_id: number;

    @Column()
    product_name: string;

    @Column()
    price: number;

    @Column()
    stock: number;

    @Column()
    description: string;

    @Column({
        type: 'enum',
        enum: ProductCondition,
        default: ProductCondition.NEW,
    })
    condition: ProductCondition;

    @Column({type: "datetime", default: ()=> "CURRENT_TIMESTAMP"})
    createdAt: Date;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => User, user => user.product,{nullable: true, onDelete: 'SET NULL'})
    @JoinColumn({ name:'user_id'}) 
    user: User;

    @ManyToOne(() => Category, category => category.product)
    @JoinColumn({ name:'category_id'}) 
    category: Category;


    @ManyToOne(() => Cart, cart => cart.products)
    @JoinColumn({ name:'id'}) 
    cart: Cart;


    @OneToMany(() => Review, review => review.review)
    review: Review[];

}


